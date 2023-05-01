import React, { useState } from "react";
import VotersPage from "./admin/VotersPage";
import BallotsPage from "./admin/BallotsPage";
import Navbar from "./admin/Navbar";

export enum Page {
  Voters,
  Ballots,
}

const AdminDashboard = (props: { clearState: () => void }) => {
  const [page, setPage] = useState(Page.Voters);

  return (
    <div id="admin">
      <Navbar
        currentPage={page}
        setPage={setPage}
        clearState={props.clearState}
      />
      {page === Page.Voters && <VotersPage clearState={props.clearState} />}
      {page === Page.Ballots && <BallotsPage clearState={props.clearState} />}
    </div>
  );
};

export default AdminDashboard;
