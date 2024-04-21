import { useSelector } from "react-redux";

function Header() {
  const { loggedIn, username } = useSelector(
    (state) => state.auth
  );

  return (
    <h1 className="text-lg font-bold underline text-center">
      {loggedIn ? <p>Welcome back {username}</p> : <p>Not logged in</p>}
    </h1>
  );
}

export default Header;
