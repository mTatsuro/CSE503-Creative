import './App.css';
import Wiki from './Wiki.js';
import Terminal from './Terminal.js';
import bcrypt from 'bcryptjs';
import Axios from 'axios';
import React, { Component, createRef, useContext, createContext, useState } from 'react';
import reactElementToJSXString from 'react-element-to-jsx-string';
import ReactDOMServer from 'react-dom/server';
import parse from 'html-react-parser';
import Popup from 'reactjs-popup';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
  useHistory,
  useLocation
} from "react-router-dom";

function App() {
  return (
    <ProvideAuth>
      <Router>
        <div>
          <AuthButton />

          <ul>
            <li>
              <Link to="/public">Public Wiki</Link>
            </li>
            <li>
              <Link to="/protected">Private Interactive Wiki</Link>
            </li>
            <li>
              <Link to="/terminal">Highlights and Comments</Link>
            </li>
          </ul>

          <Switch>
            <Route path="/public">
              <PublicPage />
            </Route>
            <Route path="/login">
              <LoginPage />
            </Route>
            <PrivateRoute path="/protected">
              <ProtectedPage />
            </PrivateRoute>
            <PrivateRoute path="/terminal">
              <OpenTerminal />
            </PrivateRoute>
          </Switch>
        </div>
      </Router>
    </ProvideAuth>
  );
}

const fakeAuth = {
  isAuthenticated: false,
  signin(cb) {
    fakeAuth.isAuthenticated = true;
    setTimeout(cb, 100); // fake async
  },
  signout(cb) {
    fakeAuth.isAuthenticated = false;
    setTimeout(cb, 100);
  }
};


const authContext = createContext();

function ProvideAuth({ children }) {
  const auth = useProvideAuth();
  return (
    <authContext.Provider value={auth}>
      {children}
    </authContext.Provider>
  );
}

function useAuth() {
  return useContext(authContext);
}

var current_user;

function useProvideAuth() {
  const [user, setUser] = useState(null);

  const signin = cb => {
    return fakeAuth.signin(() => {
      setUser(current_user);
      cb();
    });
  };

  const signout = cb => {
    return fakeAuth.signout(() => {
      setUser(null);
      cb();
    });
  };

  return {
    user,
    signin,
    signout
  };
}

function AuthButton() {
  let history = useHistory();
  let auth = useAuth();

  return auth.user ? (
    <p>
      Welcome to CSE330 Wiki, {" "} {auth.user}!
      <button
        onClick={() => {
          auth.signout(() => history.push("/"));
        }}
      >
        Sign out
      </button>
    </p>
  ) : (
    <p>You are not logged in.</p>
  );
}

// A wrapper for <Route> that redirects to the login
// screen if you're not yet authenticated.
function PrivateRoute({ children, ...rest }) {
  let auth = useAuth();
  return (
    <Route
      {...rest}
      render={({ location }) =>
        auth.user ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: "/login",
              state: { from: location }
            }}
          />
        )
      }
    />
  );
}

function PublicPage() {
  return (
    <Router>
    <Route render={(props) => <Wiki />} />
    </Router>
  );
}

function ProtectedPage() {
  return (
      <HighlightPop
          popoverItems={itemClass => (
           <React.Fragment>
                <Link to="/terminal">Comments</Link>
           </React.Fragment>
          )}>
          <PrivateRoute path="/terminal">
            <OpenTerminal />
          </PrivateRoute>
          <Router>
          <Route render={Wiki} />
          </Router>
      </HighlightPop>
  )
}

function OpenTerminal(){
  return (
    <Router>
    <Route render={(props) => <Terminal />} />
    </Router>
  )
}


function LoginPage() {
  let history = useHistory();
  let location = useLocation();
  let auth = useAuth();

  const [username,setUsername] = useState("");
  const [password,setPassword] = useState("");

  let { from } = location.state || { from: { pathname: "/" } };
  let login = () => {
    Axios.post('http://localhost:3306/api/login', {username: username, password: password}).then((data)=>{
      if (typeof data.data[0].password === 'string' && bcrypt.compareSync(password, data.data[0].password)){
        current_user = username;
        auth.signin(() => {
          history.replace(from);
        });
      } else{
        alert('Invalid username and password combination');
      }
    });
  };

  let register = () => {
    Axios.post('http://localhost:3306/api/register', {username: username, password: password}).then((data)=>{
      if (data.data){
        auth.signin(() => {
          history.replace(from);
        });
      } else{
        alert('Username is already taken');
      }
    });
  };

  return (
    <React.Fragment>
    <div>
      <p>You must log in to view the interactive wiki at {from.pathname}</p>
      <input type="text" name="username" placeholder="Username" onChange={(e)=> {setUsername(e.target.value)}}/>
      <input type="password" name="password" placeholder="Password" onChange={(e)=> {setPassword(e.target.value)}}/>
      <button onClick={login}>Log in</button>
    </div>
    <div>
      <p>Alternatively, if you don't have an account, you can register here:</p>
      <input type="text" name="username" placeholder="Username" onChange={(e)=> {setUsername(e.target.value)}}/>
      <input type="password" name="password" placeholder="Password" onChange={(e)=> {setPassword(e.target.value)}}/>
      <button onClick={register}>Register</button>
    </div>
    </React.Fragment>
  );
}


function highlightRange(range, highlight_id) {
    var newNode = document.createElement("div");
    newNode.setAttribute(
       "style",
       "background-color: yellow; display: inline;"
    );
    newNode.setAttribute("id", highlight_id)
    range.surroundContents(newNode);
}


// Save a new highlight in the database and returns its unique id
function saveHighlight(selectedText) {
  Axios.post('http://localhost:3306/api/create', {highlighted: selectedText, username: current_user}).then((data)=>{
    return data.data[0].id;
  });
}


class HighlightPop extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showPopover: false,
      x: 0,
      y: 0,
      selectedText: ''
    };

    this.highlight = createRef();
  }

  componentDidMount() {
    window.addEventListener('mouseup', this.onMouseUp);
  }

  componentWillUnmount() {
    window.removeEventListener('mouseup', this.onMouseUp);
  }

  hidePopover = () => {
    this.setState({ showPopover: false });
  };

  onMouseUp = () => {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();

    if (!selectedText) {
      this.hidePopover();
      return;
    }

		const selectionRange = selection.getRangeAt(0);

    const highlight_id = saveHighlight(selectedText);   // saves highlighted text in DB and returns its id

    highlightRange(selectionRange, highlight_id);

    const startNode = selectionRange.startContainer.parentNode;
    const endNode = selectionRange.endContainer.parentNode;

    const highlightable = this.highlight.current;
    const highlightableRegion = highlightable.querySelector('.h-popable');

    if (highlightableRegion) {
      if (
        !highlightableRegion.contains(startNode) ||
        !highlightableRegion.contains(endNode)
      ) {
        this.hidePopover();
        return;
      }
    } else if (
      !highlightable.contains(startNode) ||
      !highlightable.contains(endNode)
    ) {
      this.hidePopover();
      return;
    }

    if (!startNode.isSameNode(endNode)) {
      this.hidePopover();
      return;
    }

    const { x, y, width } = selectionRange.getBoundingClientRect();
    if (!width) {
      this.hidePopover();
      return;
    }

    this.setState({
      x: x + width / 2,
      y: y + window.scrollY - 10,
      selectedText,
      showPopover: true
    });

		const { onHighlightPop = () => {} } = this.props;
		onHighlightPop(selectedText);
	};

  render() {
    const { showPopover, x, y } = this.state;
    const { children, popoverItems } = this.props;
    const itemClass = 'h-popover-item';
    return (
      <div ref={this.highlight}>
        {showPopover && (
          <div
            className="h-popover"
            style={{ left: `${x}px`, top: `${y}px` }}
            role="presentation"
            onMouseDown={e => e.preventDefault()}
          >
            {popoverItems ? (
              popoverItems(itemClass)
            ) : (
              <span role="button" className={itemClass}>
                Add yours
              </span>
            )}
          </div>
        )}
        {children}
      </div>
    );
  }
}

HighlightPop.defaultProps = {
  onHighlightComment: null,
  onExitHighlight: null,
	popoverItems: null,
	children: null
};

export default App;
