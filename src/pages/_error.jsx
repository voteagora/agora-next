import * as Sentry from "@sentry/nextjs";
import Error from "next/error";

const CustomErrorComponent = (props) => {
  return <Error statusCode={props.statusCode} />;
};

CustomErrorComponent.getInitialProps = async (contextData) => {
  if (contextData.err) {
    await Sentry.captureException(contextData.err);
  }
  return Error.getInitialProps(contextData);
};

export default CustomErrorComponent;
