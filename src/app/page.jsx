import HomePage from "../pages/home/home";
import Navbar from "../components/navbar/navbar";
import ai from "./../public/images/ai.png";

export default function Home() {
  return (
    <div
      className="absolute top-0  w-full flex flex-col items-center justify-center text-gray-900"
      style={{
        backgroundImage: `url(${ai.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute  inset-0 bg-white bg-opacity-90 sm:bg-opacity-90"></div>
      <Navbar />
      <HomePage />
    </div>
  );
}
