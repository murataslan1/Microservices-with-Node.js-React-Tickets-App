import axios from "axios";
import { useState } from "react";

const useRequestHook = ({ url, method, body, onSuccess }) => {
  // method = 'get' | 'post' | 'patch'
  const [errors, setErrors] = useState(null);

  const doRequest = async () => {
    try {
      setErrors(null);
      const response = await axios[method](url, body);
      if (onSuccess) {
        onSuccess(response.data);
      }
      console.log("response in useRequest hook", response);
      return response.data;
    } catch (err) {
      console.log("err in useRequest hook", err);
      setErrors(
        <div className="alert alert-danger">
          <h4>Ooops....</h4>
          <ul className="my-0">
            {!!err?.response?.data?.errors &&
              err.response.data.errors.map((error) => (
                <li key={error.message}> {error.message} </li>
              ))}
          </ul>
        </div>
      );
    }
  };

  return { doRequest, errors };
};

export default useRequestHook;
