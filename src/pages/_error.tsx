import Error from "next/error";
import { FC } from "react";
import { NextPageContext } from "next";

interface ErrorProps {
  statusCode: number;
}

interface CustomErrorComponent extends FC<ErrorProps> {
  getInitialProps(ctx: NextPageContext): Promise<ErrorProps>;
}

const CustomErrorComponent: CustomErrorComponent = (props) => {
  return <Error statusCode={props.statusCode} />;
};

CustomErrorComponent.getInitialProps = async (contextData: NextPageContext) => {
  return Error.getInitialProps(contextData);
};

export default CustomErrorComponent;
