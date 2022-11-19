import { useEffect } from "react";
import useRequest from "../../hooks/use-request";
import Router from "next/router";

const SingnOut = () => {
  const { doRequest } = useRequest({
    url: `/api/users/signout`,
    method: "post",
    onSuccess: () => Router.push("/"),
  });

  useEffect(() => {
    doRequest();
  }, []);

  return <div>Signing you out...</div>;
};

export default SingnOut;
