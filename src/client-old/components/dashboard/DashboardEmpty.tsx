import css from "./DashboardEmpty.module.scss";

export const DashboardEmpty = () => (
  <div className="flex-col align-center w-100 gap-64 mx-auto">
    <img src="/img/person-walking.jpg" width={500} />
    <div className="flex-col align-center">
      <p className={css.message}>No playlists scheduled (yet).</p>
      <a href="/playlists/create" className={css.createLink}>
        Create a playlist <span className="text-decoration-none">→</span>
      </a>
    </div>
  </div>
);
