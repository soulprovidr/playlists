import { Layout } from "components/layout";
import { navigate } from "wouter/use-browser-location";

export const IndexPage = () => {
  return (
    <Layout>
      <div className="grid--2-1 gap-48 grid">
        <img src="/img/playlist-woman.jpg" width={500} />
        <form className="flex-col justify-center w-100">
          <h1>Login</h1>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input type="email" name="email" id="email" required />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input type="password" name="password" id="password" required />
          </div>
          <div className="input-group">
            <button className="w-fit" onClick={() => navigate("/playlists")}>
              Log in
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};
