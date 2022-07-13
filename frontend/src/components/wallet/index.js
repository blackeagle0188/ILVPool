import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { ethers } from "ethers";
// import WalletConnect from "walletconnect";


class Wallet extends React.Component {

    constructor(props) {
        super(props);
        // Set initial state (ONLY ALLOWED IN CONSTRUCTOR)
        this.state = {
            connected: false,
            buttonText: "use-wallet",
            address: "",
        };
    }

    componentDidMount =async()  =>{
        const { ethereum } = window;
        // console.log(window.web3);
        if (ethereum) {
            var provider = new ethers.providers.Web3Provider(ethereum);
            const accounts = await provider.listAccounts();
            if (accounts.length > 0) {
                await window.ethereum.enable();
                this.setState({address : accounts[0], buttonText: accounts[0], connected: true});
            }
        } else {
            alert("Please install Metamask or trust wallet!");
        }
    }

    connectWalletHandler = async () => {
        // const { ethereum } = window;
        if (!window.ethereum) {
            alert("Please install Metamask or trust wallet!");
        }
    
        try {
            await window.ethereum.enable();
            var provider = new ethers.providers.Web3Provider(window.ethereum);
            const accounts = await provider.listAccounts();
            this.setState({address : accounts[0], buttonText: accounts[0], connected: true});
        } catch (err) {
            console.log(err)
        }
    }

    render() {
        let length = this.state.buttonText.length;
        let string = '';

        if(!this.state.connected)
            string = this.state.buttonText;
        else
            string = this.state.buttonText.slice(0,5) + '...' + this.state.buttonText.slice(length -  4,length);
        return (
            <Container>
                <div className="connect-wallet">    
                    <Button variant="success" onClick={this.connectWalletHandler} disabled={this.state.connected}>{string}</Button>
                </div>
            </Container>
        );
    }
}

export default Wallet;