import "bootstrap/dist/css/bootstrap.css";
import buildClient from "../api/build-client";
import Header from "../src/components/header";

const AppComponent = ({ Component, pageProps, currentUser }) => {
  // how nextjs shows the matched route:
  // show on default component: app.js  (_app.js is custom default component)
  // Component corresponds to either apple, index or any matched routes
  // to import bootstarp: import in this default component
  return (
    <div>
      <Header currentUser={currentUser} />
      <Component {...pageProps} />
    </div>
  );
};

AppComponent.getInitialProps = async (appContext) => {
  // nextJS client server is a proxy server
  // what the browser has is appended on the nextJS client server
  const axiosInstance = buildClient(appContext.ctx);
  const { data } = await axiosInstance.post("/api/users/currentuser");
  // after invoking getInitailProps all the getIntialProps will be disable
  // so we need to manually invoke the getInitialProps functions
  let pageProps = {};
  if (appContext.Component.getInitialProps) {
    pageProps = await appContext.Component.getInitialProps(appContext.ctx);
  }

  return {
    pageProps,
    ...data,
  };
};

export default AppComponent;
