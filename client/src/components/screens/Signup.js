import React, { useState, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
import M from "materialize-css";

const Signup = () => {

  const history = useHistory();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [image, setImage] = useState("");
  const [url, setUrl] = useState(undefined);

  useEffect(() => {
    if (url) {
      uploadFields();
    }
  }, [url])

  const uploadProfilePic = () => {
    const data = new FormData();
    data.append("file", image);
    data.append("upload_preset", "shopigram");
    data.append("cloud_name", "shopigram");
    fetch("https://api.cloudinary.com/v1_1/shopigram/image/upload", {
      method: "post",
      body: data,
    })
      .then((response) => response.json())
      .then((data) => {
        setUrl(data.secure_url);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const uploadFields = () => {
    if (
      !/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
        email
      )
    ) {
      return M.toast({
        html: "Invalid e-mail",
        classes: "#d81b60 pink darken-1",
      });
    }
    fetch("/signup", {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        password,
        pic: url
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          M.toast({ html: data.error, classes: "#d81b60 pink darken-1" });
        } else {
          M.toast({ html: data.message, classes: "#00695c teal darken-3" });
          history.push("/login");
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const PostData = () => {
    if (image) {
      uploadProfilePic();
    } else {
      uploadFields();
    }
  };

  return (
    <div className="mycard">
      <div className="card auth-card input-field">
        <h2>Signup</h2>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value.toLowerCase())}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="file-field input-field">
          <div className="btn waves-effect waves-light #1976d2 blue darken-2">
            <span>Upload Json File</span>
            <input
              type="file"
              onChange={(e) => {
                setImage(e.target.files[0]);
              }}
            />
          </div>
          <div className="file-path-wrapper">
            <input className="file-path validate" type="text" />
          </div>
        </div>
        <button
          className="btn waves-effect waves-light #1976d2 blue darken-2"
          onClick={() => PostData()}
        >
          Sign up
        </button>
        <h5>
          <Link to="/login">Already have an account?</Link>
        </h5>
      </div>
    </div>
  );
};

export default Signup;
