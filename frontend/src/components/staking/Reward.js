import React, { useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import BigNumber from "bignumber.js";
import "./stake.css";

export default function Reward({ stakingContractObject }) {
  const { chainId, account, activate, active, library } = useWeb3React();
  const [stakelist, setStakelist] = useState([]);
  const [rewardlist, setRewardlist] = useState([]);

  useEffect(() => {
    const getStakeInfo = async () => {
      try {
        let stakes = await stakingContractObject.methods
          .getStakeInfoByAddress(account)
          .call();

        console.log(stakes);
        setStakelist(stakes);
      } catch (e) {
        console.log(e);
      }
    };

    if (account && stakingContractObject) {
      getStakeInfo();
    }
  }, [account, stakingContractObject]);

  useEffect(() => {
    const getRewardlist = async () => {
      try {
        let rewards = await Promise.all(
          stakelist.map(async (stake, index) => {
            let value = await stakingContractObject.methods
              .pendingReward(account, index)
              .call();
            return value;
          })
        );
        setRewardlist(rewards);
        console.log(rewards);
      } catch (e) {
        console.log(e);
      }
    };

    if (stakelist.length > 0) {
      getRewardlist();
      setInterval(getRewardlist, 10000);
    }
  }, [stakelist]);

  const handleClaim = async (index) => {
    try {
      let value = await stakingContractObject.methods
        .getStakeClaimable(account, index)
        .call();

      if (value === false) {
        alert("You cannot claim");
      } else {
        let claims = await stakingContractObject.methods
          .claim(index)
          .send({ from: account });
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleWithdraw = async (index) => {
    try {
      let value = await stakingContractObject.methods
        .getStakeClaimable(account, index)
        .call();

      if (value === false) {
        alert("You cannot unstake");
      } else {
        let unstakes = await stakingContractObject.methods
          .withdraw(index)
          .send({ from: account });
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="rewards">
      {rewardlist.length > 0 &&
        stakelist.map((stake, index) => {
          let depositTime = new Date(parseInt(stake.depositTime) * 1000);
          let lockDurationdate = new Date();
          lockDurationdate.setDate(
            depositTime.getDate() + stake.lockPeriod / 86400
          );
          console.log("ddd=>", depositTime);
          return (
            <div className="reward" key={index}>
              <p>
                Staking amount:{" "}
                {new BigNumber(stake.amount).dividedBy(10 ** 18).toString()} ILV
              </p>
              <p>
                Deposit time: {depositTime.getDate()}/
                {depositTime.getMonth() + 1}/{depositTime.getFullYear()}
              </p>
              <p>
                Due date: {lockDurationdate.getDate()}/
                {lockDurationdate.getMonth() + 1}/
                {lockDurationdate.getFullYear()}
              </p>
              <p>
                Current reward:{" "}
                {new BigNumber(rewardlist[index])
                  .dividedBy(10 ** 18)
                  .toString()}
              </p>
              <div>
                <button onClick={() => handleClaim(index)}>Claim</button>
                <button onClick={() => handleWithdraw(index)}>Unstake</button>
              </div>
            </div>
          );
        })}
    </div>
  );
}
