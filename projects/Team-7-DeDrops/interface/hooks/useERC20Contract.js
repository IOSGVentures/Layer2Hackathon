import useContract from "./useContract";
import { IERC20 as IERC20ABI } from "constans/abi/IERC20";

/**
 * @name useERC20Contract
 * @description Uses the new Human-Readable ABI format from ethers v5. Supports ERC20 contract functions of 'balanceOf', 'transfer', and the 'Transfer' event itself.
 * @param {string} tokenAddress
 */
export default function useERC20Contract(tokenAddress) {
  return useContract(tokenAddress, IERC20ABI);
}
