import './App.css';
import React,{Component, createRef, useContext, createContext, useState, useEffect} from 'react';
import Axios from 'axios';

function Comments() {
  const highlightId = sessionStorage.getItem('id');
  const [ commList, setCommList ] = useState([]);
  const [text, setText] = useState("");

  const submitPost = () => {
    Axios.post('http://localhost:3306/api/saveComment', {highlightId: highlightId, text:text})
  }

  useEffect(()=>{
    Axios.get('http://localhost:3306/api/getFromId/${id}').then((data)=>{
      setCommList(data.data);
    });
  },[])


  return (
    <div className="App">
      <h1>Comments to the highlight</h1>
      <div class="highlist">
          {commList.map(comment => {
            <div id={comment.id} key={comment.id + comment.body} name="todo" value={comment.id}>
                -- {comment.body}
            </div>
          })}
      </div>
      <div className="uploadPost">
          <label>Post Comment</label>
          <textarea onChange={(e)=>{setText(e.target.value)}}> </textarea>
          <button onClick={submitPost}>Submit Comment</button>
      </div>
    </div>
  );
}

export default Comments;
