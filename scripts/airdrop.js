const fs = require("fs");
const { ethers } = require("ethers");
require("dotenv").config();

async function sendAndFinalize(signer, tx, nonce) {
  console.log(`Sending transaction with nonce: ${nonce}`);
  try {
    const gasEstimate = await signer.estimateGas({ ...tx, nonce });
    console.log(`Gas estimate: ${gasEstimate.toString()}`);
    
    const txResponse = await signer.sendTransaction({ ...tx, nonce, gasLimit: gasEstimate });
    console.log(`Transaction sent. Hash: ${txResponse.hash}`);
    await txResponse.wait();
    console.log(`Transaction confirmed. Hash: ${txResponse.hash}`);

    let retries = 8;
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    const backoff = 1.5;
    let delayTime = 100;

    while ((await signer.getTransactionCount("pending")) <= nonce) {
      if (retries === 0) {
        console.log("Response timeout after max retries");
        throw new Error("Response timeout");
      }
      console.log(`Waiting for nonce to increase. Current retries: ${retries}`);
      await delay(delayTime);
      delayTime = Math.floor(delayTime * backoff);
      retries--;
    }
    console.log(`Nonce has increased. Transaction finalized. Hash: ${txResponse.hash}`);
    return txResponse;
  } catch (error) {
    console.error(`Failed to send transaction: ${error.message}`);
    if (error.data && error.data.message) {
      console.error(`Error data: ${error.data.message}`);
    }
    throw error;
  }
}

async function main() {
  console.log("Loading recipient addresses from List.json");
  const list = JSON.parse(fs.readFileSync('List.json', 'utf8'));
  const recipients = list.recipients;
  const batchSize = 100;
  const tokenAddress = "0xEC7f467F605AccAc9D8ecd260C981A80Bd1D1C78"; // DogOnMoon token address

  const provider = new ethers.providers.JsonRpcProvider("https://coston-api.flare.network/ext/C/rpc"); // Update with your actual RPC URL
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  const amount = ethers.utils.parseUnits("0.888", 18); // 0.888 Moon tokens

  console.log("Connecting to ERC20Multisender contract");
  const multisenderAddress = "0x1A27e714cF5ae8d84c1a9988cE3e19e9102a710D";
  const ERC20Multisender = new ethers.Contract(multisenderAddress, [
    "function multisendToken(address token, address[] calldata recipients, uint256 amount) external"
  ], signer);

  console.log("Approving multisender contract to spend tokens");
  const tokenContract = new ethers.Contract(tokenAddress, [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function balanceOf(address account) view returns (uint256)"
  ], signer);
  const totalAmount = amount.mul(recipients.length);
  const senderBalance = await tokenContract.balanceOf(signer.address);
  console.log(`Sender's token balance: ${senderBalance.toString()}`);
  if (senderBalance.lt(totalAmount)) {
    throw new Error("Insufficient token balance for the airdrop");
  }
  const approveTx = await tokenContract.approve(multisenderAddress, totalAmount);
  console.log(`Approval transaction hash: ${approveTx.hash}`);
  await approveTx.wait();
  console.log("Approval transaction confirmed");

  const tps = 2;
  const delayBetweenTx = Math.floor(1000 / tps);

  let nonce = await signer.getTransactionCount("pending");

  for (let i = 0; i < recipients.length; i += batchSize) {
    const batchRecipients = recipients.slice(i, i + batchSize);
    console.log(`Airdropping to batch ${i / batchSize + 1}`);
    try {
      const tx = await ERC20Multisender.populateTransaction.multisendToken(tokenAddress, batchRecipients, amount);
      console.log(`Populated transaction for batch ${i / batchSize + 1}`);
      const txResponse = await sendAndFinalize(signer, tx, nonce);
      nonce++;
      console.log(`Airdrop transaction hash for batch ${i / batchSize + 1}: ${txResponse.hash}`);
      console.log(`Batch ${i / batchSize + 1} complete`);
      await new Promise(resolve => setTimeout(resolve, delayBetweenTx));
    } catch (error) {
      console.error(`Airdrop failed for batch ${i / batchSize + 1}: ${error.message}`);
      if (error.data && error.data.message) {
        console.error(`Error data: ${error.data.message}`);
      }
      try {
        console.log(`Retrying batch ${i / batchSize + 1}`);
        nonce = await signer.getTransactionCount("pending");
        const tx = await ERC20Multisender.populateTransaction.multisendToken(tokenAddress, batchRecipients, amount);
        const txResponse = await sendAndFinalize(signer, tx, nonce);
        nonce++;
        console.log(`Retry successful for batch ${i / batchSize + 1}: ${txResponse.hash}`);
      } catch (retryError) {
        console.error(`Retry failed for batch ${i / batchSize + 1}: ${retryError.message}`);
        if (retryError.data && retryError.data.message) {
          console.error(`Retry error data: ${retryError.data.message}`);
        }
        break;
      }
    }
  }

  console.log("Airdrop complete");
}

main().catch((error) => {
  console.error("An error occurred during the airdrop process:", error);
  process.exitCode = 1;
});
