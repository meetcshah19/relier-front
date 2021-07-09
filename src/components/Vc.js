import { useParams } from "react-router-dom";
import VideoRoomComponent from "./VideoRoomComponent";
export default function Vc() {
  const { sid } = useParams();

  return (
      <>
        <VideoRoomComponent sessionName={sid}></VideoRoomComponent>
      <h1>{sid}</h1>
    </>
  );
}
