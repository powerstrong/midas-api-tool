import { EndpointGridPanel } from "../components/EndpointGridPanel";
import type { EndpointPageProps } from "./EndpointPageProps";

const NODEPage = (props: EndpointPageProps) => {
  return <EndpointGridPanel {...props} />;
};

export default NODEPage;
