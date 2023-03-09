import React, { useState } from 'react'

const Chat = ({contract, funcConnectAccount}) => {
    async function connectAccount() {
        if(typeof window.ethereum == "undefined") {
          console.log("metamask is not installed");
          return;
        }
        const accounts = await window.ethereum.request({method: 'eth_requestAccounts'});
        const account = accounts[0];
        // console.log(account);
        return account;
      }

    const [message,messages] = useState([]);

    async function sendMessage(message) {
        const account = await connectAccount();
        console.log(account);
        const namePlayer = await contract.methods.namePlayer(account).call();
        console.log(namePlayer);
        console.log(contract)
        const sendMess = await contract.methods.messages(namePlayer,message).send({from:account,gas: 3000000});
        console.log(sendMess)
        if(sendMess) {
            const allMessages = await contract.methods.chat().call();
            messages(prev=> prev = allMessages);
            console.log(allMessages)
        }
    }
  return (
    <div className='chat'>
        <h1>Чат</h1>
        <div className='box'>
            {message.map((mess,index)=>
             <div key={index}>
                <h2>mess.name</h2>
                <p>mess.message</p>
             </div>)
            }
        </div>
        
        <div className='last'>
            <input type="text" className='mess'/>
            <button onClick={()=>{sendMessage(document.querySelector('.mess').value)}}>Отправить</button>
        </div>
       
    </div>

  )
}

export default Chat