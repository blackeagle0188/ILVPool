import React, { useState, useEffect } from "react";
import Reward from "../../components/staking/Reward";
import StackingCard from "../../components/staking/StackingCard";
import WalletConnect from "../../components/wallet/walletconnect";
import "./index.css";
import { ILVTOKEN_ADDRESS, STAKING_ADDRESS } from "../../constant";
import StakingContract from "../../contracts/ILVStaking.json";
import TokenContract from "../../contracts/ILVToken.json";
import { useWeb3React } from "@web3-react/core";
import Web3 from "web3";
import BigNumber from "bignumber.js";

function Home() {
  const { chainId, account, activate, active, library } = useWeb3React();
  const [balance, setBalance] = useState(0);
  const [tokeContractObject, setTokeContractObject] = useState();
  const [stakingContractObject, setStakingContractObject] = useState();

  let web3, TokenContractObject, StakingContractObject;

  useEffect(() => {
    (async () => {
      try {
        if (account && chainId && library) {
          web3 = new Web3(library.provider);
          TokenContractObject = new web3.eth.Contract(
            TokenContract.abi,
            ILVTOKEN_ADDRESS
          );
          setTokeContractObject(TokenContractObject);
          StakingContractObject = new web3.eth.Contract(
            StakingContract.abi,
            STAKING_ADDRESS
          );
          setStakingContractObject(StakingContractObject);

          // await v1alphaBalanceWeb3.methods.approve(addr, new BigNumber(200000).multipliedBy(10 ** 18)).send({from: account});
          try {
            let value = await TokenContractObject.methods
              .balanceOf(account)
              .call({ from: account });
            console.log("value=>", value);
            value = new BigNumber(value).dividedBy(10 ** 18).toString();
            setBalance(value);
            // value = new BigNumber(value).dividedBy(10 ** 18).toString();
            // setTotalStake(value);
            // console.log(value);
          } catch (err) {
            console.log(err);
            console.log("failed get.");
            return;
          }
          //   setLoading(false);
        }
      } catch (err) {
        console.log(err);
        return;
      }
    })();
  }, [chainId]);

  return (
    <div className="body">
      <div className="main_body">
        <div>
          <WalletConnect />
        </div>
        <div>
          <StackingCard
            account={account}
            balance={balance}
            tokeContractObject={tokeContractObject}
            stakingContractObject={stakingContractObject}
          />
        </div>
        <div className="reward_section">
          <Reward stakingContractObject={stakingContractObject} />
        </div>
      </div>
    </div>
  );
}

export default Home;
