import './App.css';
import React,{Component, createRef, useContext, createContext, useState, useEffect} from 'react';
import Axios from 'axios';
import HighList from "./HighList";
import Comments from "./Comments";

function Terminal() {
  const [ highList, setHighList ] = useState([]);

  useEffect(()=>{
    Axios.get('http://localhost:3306/api/getHighlight').then((data)=>{
      setHighList(data.data);
    });
  },[])


  // Handle viewing comments
  const handleToggle = (id) => {
    let mapped = highList.map(highlight => {
      Comments(highlight.id, highlight.body);
    });
    setHighList(mapped);
  }


  return (
    <div className="App">
      <h1>Text chunks highlighted by users</h1>
      <p>Click on them to see comments</p>
      <HighList highList={highList} handleToggle={handleToggle}/>
    </div>
  );
}

export default Terminal;
