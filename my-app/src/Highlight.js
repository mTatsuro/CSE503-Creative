import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
  useHistory,
  useLocation
} from "react-router-dom";
import Comments from "./Comments";

const Highlight = ({highlight, handleToggle}) => {

    const handleClick = (e) => {
      sessionStorage.setItem('id', e.currentTarget.id);
    }

    return (
        <div id={highlight.id} key={highlight.id + highlight.body} name="todo" value={highlight.id} onClick={handleClick}>
            <Link to="/comment">-- {highlight.body}</Link>
            <Route path="/comment">
              <Comments />
            </Route>
        </div>
    );
};

export default Highlight;
