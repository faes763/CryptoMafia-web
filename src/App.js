import { ContractABI } from "./contractABI";
import Web3 from 'web3';
import { useEffect, useState } from "react";
import './app.css';

import Chat from "./Chat";

import peaceful from './images/peaceful.png';
import mafia from './images/mafia.png';
import doctor from './images/doctor.png';

function App() {
  const provider = new Web3(Web3.givenProvider);
  const web3 = new Web3(provider);
  const contractAddress = '0xB0df0079c066158e88426A2d01cBB21db6939Ea5';
  const [text, setText] = useState("Игрок в режиме ожидания. Нажмите кнопку если готовы играть");
  const [stateGame, setStateGame]= useState("Игры"); 


  const [playerWidget, setPlayerWidget] = useState([]);

  const contract = new web3.eth.Contract(ContractABI, contractAddress);

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
  async function deposit(name,amount) {
    console.log(contract)
    amount = Number(amount)
    let account = await connectAccount();
    const contractDeposit = await contract.methods.deposit(name,amount,account).send({from: account, gas: 3000000, value: amount}).then(console.log("Всё хорощо"))
    console.log(contractDeposit);
    if(contractDeposit) {
      setText("Игрок в режиме ожидания");
    }
    // if(contractDeposit) visible = true;
  }

  async function readyMember() {
    let account = await connectAccount();
    console.log(account)
    const contractReadyMember = await contract.methods.readyMember().send({from:account,gas: 3000000}).then(console.log("Мечта"))
    console.log(contractReadyMember)
    if(contractReadyMember) setText("Вы готовы. Ждём других игроков");
    const checkLengthArr = await contract.methods.lengthPlayerArr().call().then(console.log('Вернулась длина массива'));
    const checkLengthReady = await contract.methods.amountReady().call().then(console.log('Вернулась длина массива'));
    if(checkLengthArr == checkLengthReady) {
      if(await contract.methods.game().call() == 1){
        setStateGame("игры");
        playerInfo();
      } 
    }
  }

  const [visible, setVisible] = useState(false);
  const [visibleStart, setVisibleStart] = useState(false);

  async function lengthPlayer() {
    const checkLengthArr = await contract.methods.lengthPlayerArr().call().then(console.log('Вернулась длина массива'));
    return checkLengthArr;
  }

  async function playerInfo() {
    let account = await connectAccount();
    const namePlayer = await contract.methods.namePlayer(account).call();
    const playerHUD = await contract.methods.playerHUD(account).call().then((elem)=>{
      let playWid = playerWidget.push({
        name: namePlayer,
        role: elem.role,
        heal: elem.heal,
        img: peaceful
      })
      if(elem.role == "Mafia") {
        playWid.img = mafia;
      }
      if(elem.role == "Doctor") {
        playWid.img = doctor;
      }
    })
    console.log(playerHUD)
  }


  useEffect(()=>{
    async function checkInfo() {
      let account = await connectAccount();
      if(await contract.methods.playerHUD(account).call()) setVisible(true);
      console.log(visibleStart)
      if(await contract.methods.game().call() == 0) setStateGame("старта");   
    }
    checkInfo();

  },[])
  return (
    <div className="boss">
      <Chat contract={contract} ></Chat>
      <div className="App">
            {/* <img src={peaceful} height="50px"/> */}
            <h1 className="logo">CryptoMafia</h1>
            <h1 className="setGame">Мафия в состоянии {stateGame}</h1>
            <button onClick={()=>{console.log(visibleStart);setVisibleStart(prev=>{ return !prev})}}>Start menu</button>
              {visibleStart ?
              <div>
                <div className="column">
                  <input className="name" placeholder="Введите имя"/>
                  <input className="amount" placeholder="Введите ставку" type="number"/> 
                  <button onClick={()=>{deposit(document.querySelector(".name").value,document.querySelector(".amount").value)}}>Зарегистрироваться</button>
                </div>
                {visible ? <div><button className="play"onClick={readyMember}>{text}</button></div> : <div><h1>Не зарегестрирован</h1></div>}
              </div>
              :
              <div>
                <h2>Ваша карточка</h2>
                <div>
                  <button onClick={playerInfo}>Увидеть игрока</button>
                  {playerWidget.map((player,index)=>
                    <div key={index}>
                      <h3>{player.name}</h3>
                      <img src={player.img}/>
                      {player.heal ? <p>Вас вылечили</p> : <p>Вас не лечили</p> }
                      <small>{player.role}</small>
                    </div>
                  )}
                </div>
              </div>
              }
      </div>
    
    </div>
  );
}

export default App;