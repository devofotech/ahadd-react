import AssetCard from '@Components/AssetCard';
import { Grid } from '@material-ui/core';
import React from 'react';
import Table from '@Components/MaterialTable/v5';

const AssetListContent = ({ user, ...h }) => {
  if (h.view === 'card') {
    return (
      <Grid container spacing={1} className="overflow-auto" style={{ maxHeight: '70vh' }}>
        {h.projects.map((projects, index) => (
          <AssetCard data={projects} number={index + 1} userData={user} {...h} />
        ))}
      </Grid>
    );
  }
  return (
    <Grid container spacing={1}>
      <Grid xs={12}>
        <Table
          tableHead
          tableData={h.projects}
          tableMinWidth={300}
          tableMaxHeight={900}
          {...h}
        />
      </Grid>
    </Grid>
  );
};

export default AssetListContent;
