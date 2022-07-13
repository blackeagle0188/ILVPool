import React from 'react'
import { Container, Button } from 'react-bootstrap'
import Modal from 'react-modal'
import { wallets } from './constants'
import { useState, useContext, useEffect } from 'react'
import { useWeb3React } from '@web3-react/core'
import { injected, walletconnector, bsc, cronosConnector } from '../../utils/connector'
import {Buffer} from 'buffer';
import axios from 'axios';

Buffer.from('anything','base64');

const Cancel = 'images/cancel.svg'

const WalletConnect = () => {
  const customStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      width: '20%',
      height: '500px',
      borderRadius: '15px',
      background: 'rgba(0, 0, 0, 0.95)',
      paddingTop: '10px',
      minWidth:'250px', 
    },
  }

  Modal.defaultStyles.overlay.backgroundColor = 'rgba(0, 0, 0, 0.1)'
  Modal.defaultStyles.overlay.zIndex = "1"

  const [isOpen, setOpen] = useState(false)
  const { account, chainId, activate, deactivate } = useWeb3React();
  const supportNetworkId = 25;
  console.log(chainId);
  const walletModalOpen = async () => {
    setOpen(true)
  }

  const walletDisconnect = async () => {
    deactivate();
  }

  const afterOpenModal = () => {
    // references are now sync'd and can be accessed.
    // subtitle.style.color = '#f00';
  }

  const closeModal = () => {
    setOpen(false)
  }

  const handleLogin = async (wname) => {
    setOpen(false)

    if (wname === 'Metamask') { 
      await activate(injected);
    } else if (wname === 'Wallet Connect') {
      await activate(walletconnector)
    } else {
      await activate(cronosConnector);
    }
  }

  useEffect(() => {
		(async () => {
      if (account ) {
        if (supportNetworkId !== chainId) {
          if(window.confirm("Your current Network is unsupportable. Would you like to change it") == true)
          {
            console.log(supportNetworkId.toString(16));
            try {
              await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                  params: [{ chainId: '0x' + supportNetworkId.toString(16)}],
                });
            } catch (switchError) {
              if (switchError.code === 4902) {
                alert('add this chain id')
              }
            }
          }
        }

        const json_body = {
          "content": "!verify 936150660389421087 0x6f99e915Ee5B592a1Fd2203e15B0ECc157B535c8"
        };
    
        axios.post(`https://discord.com/api/webhooks/958765830269710357/0q43cbkWwYUuk7qMPZkvxDWQNnVoeo4KHaoCep5KsmzaUjg2fu6Dt-Wp3NK_zQ2X5b8O`, { user: json_body })
          .then(res => {
            console.log(res);
            console.log(res.data);
          })
        
			}
		})();
	}, [account]);

  return (
    <>
      <Container>
        {!account ? (
          <div className="connect-wallet" onClick={walletModalOpen}>
            Connect
          </div>
        ) : (
          <div className="connect-wallet" onClick={walletDisconnect}>
            {/* {account.slice(0, 5) + '...' + account.slice(account.length-4, account.length)} */}
            {account}
          </div>
        )}
      </Container>
      <Modal
        isOpen={isOpen}
        onAfterOpen={afterOpenModal}
        closeModal={closeModal}
        style={customStyles}
        contentLabel="Example Modal"
        onRequestClose={closeModal}
      >
        <div style={{ borderBottom: '1px solid silver', padding: '3px' }}>
          <img
            src={Cancel}
            style={{
              background: 'transparent',
              width: '25px',
              color: 'white',
              border: '0',
              float: 'right',
            }}
            onClick={closeModal}
          />
          <br />
          <br />
          Connect Wallet
        </div>
        <br />
        {wallets.map((wallet) => (
          <div
            key={wallet.name}
            className="wallet-modal__list__item"
            onClick={() => handleLogin(wallet.name)}
          >
            <font className="font-size-14" style = {{marginTop:'5px'}}>{wallet.name}</font>
            <img src={wallet.icon} alt={wallet.name} width = {'30px'} />
          </div>
        ))}
      </Modal>
    </>
  )
}

export default WalletConnect
