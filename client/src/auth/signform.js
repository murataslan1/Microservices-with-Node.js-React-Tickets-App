import { useState } from "react";
import useRequestHook from "../../hooks/use-request";
import Router from "next/router";

const SignForm = ({ method }) => {
  // method = 'in' | 'up'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  console.log("url", `/api/users/sign${method}`);
  const { errors, doRequest } = useRequestHook({
    url: `/api/users/sign${method}`,
    method: "post",
    body: { email, password },
    onSuccess: () => Router.push("/"),
  });

  const onSubmit = async (event) => {
    event.preventDefault();
    const data = await doRequest();
  };

  return (
    <form action="" onSubmit={onSubmit}>
      <h1>Sign {method}</h1>
      <div className="form-group">
        <label htmlFor="">Email Address</label>
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="form-control"
        />
      </div>
      <div className="form-group">
        <label htmlFor="">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="form-control"
        />
      </div>
      {errors}

      <button className="btn btn-primary">Sign {method}</button>
    </form>
  );
};

export default SignForm;
