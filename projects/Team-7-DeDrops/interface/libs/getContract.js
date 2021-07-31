import { Contract } from "@ethersproject/contracts";

export default function GetContract(address, ABI, account, library) {
  const contractIns =
    !!address && !!ABI && !!library
      ? new Contract(
          address,
          ABI,
          library.getSigner(account).connectUnchecked()
        )
      : undefined;
  return contractIns;
}
