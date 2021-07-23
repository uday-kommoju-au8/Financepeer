import React, { useContext, useRef, useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { UserContext } from "../App";
import M from "materialize-css"

const NavBar = () => {
  const searchModal = useRef(null);
  const [search, setSearch] = useState("");
  const [userDetails, setUserDetails] = useState([])
  const { state, dispatch } = useContext(UserContext);
  const history = useHistory();
    useEffect(() => {
    M.Modal.init(searchModal.current)
  }, [])
  const renderList = () => {
   
    if (state) {
      return [
        
        <li key="logout">
          <button
            className="btn #c62828 red darken-3"
            onClick={() => {
              localStorage.clear();
              dispatch({ type: "CLEAR" });
              history.push("/login");
            }}
            style={{
              marginRight: "10px"
            }}
          >
            Logout
          </button>
        </li>,
      ];
     
    } else {
      return [
        <li key="login">
          <Link to="/login">Login</Link>
        </li>,
        <li key="signup">
          <Link to="/signup">Sign up</Link>
        </li>,
      ];
    }
  };

  
  const fetchUsers = (query) => {
    setSearch(query)
    fetch("/searchusers", {
      method: "post",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        query
      })
    }).then(response => response.json())
    .then(results => {
      setUserDetails(results.user)
    })
  }

  return (
    <nav>
      <div className="nav-wrapper white">
        <Link to={state ? "/" : "/login"} className="brand-logo left" style={{marginLeft:"10px"}}>
          FINANCEPPER
        </Link>
        <ul id="nav-mobile" className="right">
          {renderList()}
        </ul>
      </div>
      
    </nav>
  );
};

export default NavBar;
