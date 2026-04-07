import { EndpointGridPanel } from "../components/EndpointGridPanel";
import type { EndpointPageProps } from "./EndpointPageProps";

const ELEMPage = (props: EndpointPageProps) => {
  return <EndpointGridPanel {...props} />;
};

export default ELEMPage;
