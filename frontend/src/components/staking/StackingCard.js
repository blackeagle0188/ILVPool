import React, { useState } from "react";
import { ILVTOKEN_ADDRESS, STAKING_ADDRESS } from "../../constant";
import "./stake.css";
import BigNumber from "bignumber.js";

export default function StackingCard({
  account,
  balance,
  tokeContractObject,
  stakingContractObject,
}) {
  const [stakeAmount, setStakeAmount] = useState(0);
  const [lockDuration, setLockDuration] = useState(30);
  const [sliderStatus, setSliderStatus] = useState(false);

  const handleValue = (e) => {
    setLockDuration(e.target.value);
  };

  const handleStakeAmount = (percent) => {
    setStakeAmount((balance * percent) / 100);
  };

  const handleStake = async () => {
    if (!account) {
      alert("Connect wallet");
      return;
    }

    try {
      let allowedamount = await tokeContractObject.methods
        .allowance(account, STAKING_ADDRESS)
        .call();
      allowedamount = new BigNumber(allowedamount)
        .dividedBy(10 ** 18)
        .toString();
      if (stakeAmount > allowedamount) {
        let depositValue = new BigNumber(stakeAmount).multipliedBy(10 ** 18);
        let approveStatus = await tokeContractObject.methods
          .approve(STAKING_ADDRESS, depositValue)
          .send({ from: account });
        depositfunc();
      } else {
        depositfunc();
      }
    } catch (err) {
      console.log(err);
      return;
    }
  };

  const depositfunc = async () => {
    let depositValue = new BigNumber(stakeAmount).multipliedBy(10 ** 18);
    let approveStatus = await stakingContractObject.methods
      .deposit(depositValue, new BigNumber(lockDuration))
      .send({ from: account });
  };

  return (
    <div className="staking_card">
      <div>
        <div>
          <p>Stake</p>
        </div>
        <div>
          <p>ILV Pool</p>
        </div>
        <div className="amount_text">
          <p>Balance: {balance} ILV</p>
        </div>
        <div className="amount_box">
          <label htmlFor="amount">Amount</label>
          <input
            name="amount"
            value={stakeAmount}
            onChange={(e) => setStakeAmount(e.target.value)}
          />
        </div>
        <div className="percent">
          <button onClick={() => handleStakeAmount(25)}>25%</button>
          <button onClick={() => handleStakeAmount(50)}>50%</button>
          <button onClick={() => handleStakeAmount(75)}>75%</button>
          <button onClick={() => handleStakeAmount(100)}>100%</button>
        </div>
        <div>
          <p>Duration</p>
        </div>
        <div className="duration">
          <button onClick={() => setLockDuration(30)}>1 Month</button>
          <button onClick={() => setLockDuration(90)}>3 Months</button>
          <button onClick={() => setLockDuration(180)}>6 Months</button>
          <button onClick={() => setLockDuration(365)}>12 Months</button>
          <button onClick={() => setSliderStatus(!sliderStatus)}>Custom</button>
        </div>
        {sliderStatus && (
          <div className="range_value">
            <input
              type="range"
              name="quantity"
              className="range_slider"
              min="30"
              max="365"
              value={lockDuration}
              onChange={handleValue}
            />
            <output htmlFor="quantity">{lockDuration}</output>
          </div>
        )}
        <div className="stake_btn">
          <button onClick={() => handleStake()}>Stake</button>
        </div>
      </div>
    </div>
  );
}
