import "./home.scss";
import Intro from "../intro/intro";
import PageTitle from "../../components/page-title/page-title";

const Home = () => {
  return (
    <div className="home">
      <PageTitle contentRows={[`Welcome to`, `Rock Paper Scissors Lizard Spock`]} />
      <Intro />
    </div>
  );
};
export default Home;
