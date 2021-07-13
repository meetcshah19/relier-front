import { useParams } from "react-router-dom";
import VideoRoomComponent from "./VideoRoomComponent";
import jwt_decode from "jwt-decode";
import Cookies from "js-cookie";
export default function Vc() {
  const { sid } = useParams();

  return (
    <>
      <VideoRoomComponent
        sessionName={sid}
        user={jwt_decode(Cookies.get("token")).name}
      ></VideoRoomComponent>
      <h1>{sid}</h1>
    </>
  );
}
