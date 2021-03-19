import { useCallback } from "react";
import { Box, Grid, Typography } from "@material-ui/core";
import styled from "styled-components";
import { UniswapGetPair } from "../../../containers/Uniswap";
import { findInfoByName } from "../../../constants/perpetuals";
import PerpetualState from "../../../containers/PerpetualState";
import { utils } from "ethers";
import { calculateFairValue } from "../../../utils/calculators";
const { parseEther, formatUnits: fromWei, parseBytes32String } = utils;

const Label = styled.div`
  color: #999999;
`;

const Small = styled.span`
  font-size: 1rem;
`;

const DataBox = styled(Box)`
  border: 1px solid #434343;
  padding: 1rem 1rem;
  margin: 1rem 1rem;
`;

export type PerpetualInfoViewType = {
  fairValue: [string, string];
  marketPrice: [string, string];
  fundingRate: [string, string];
};

// marketPrice: This is what the synth is currently trading at on an AMM
// fundingRate: This is the current funding rate pulled from perp contract
// fairValue: This is the funding rate times market price
export function PerpetualInfoView({
  fairValue,
  marketPrice,
  fundingRate,
}: PerpetualInfoViewType) {
  return (
    <Grid container spacing={0}>
      <Grid item md={4} xs={12}>
        <DataBox>
          <Typography variant="h4">
            <strong>{fairValue[0]}</strong>
            <Small> {fairValue[1]}</Small>
          </Typography>
          <Label>Fair Value</Label>
        </DataBox>
      </Grid>
      <Grid item md={4} xs={12}>
        <DataBox>
          <Typography variant="h4">
            <strong>{marketPrice[0]}</strong>
            <Small> {marketPrice[1]}</Small>
          </Typography>
          <Label>Market Price</Label>
        </DataBox>
      </Grid>
      <Grid item md={4} xs={12}>
        <DataBox>
          <Typography variant="h4">
            <strong>{fundingRate[0]}</strong>
            <Small> {fundingRate[1]}</Small>
          </Typography>
          <Label>Funding Rate</Label>
        </DataBox>
      </Grid>
    </Grid>
  );
}

function PerpetualInfoLoading() {
  return (
    <PerpetualInfoView
      fairValue={["Loading...", ""]}
      marketPrice={["Loading...", ""]}
      fundingRate={["Loading...", ""]}
    />
  );
}

export function PerpetualInfo() {
  const { data, error } = PerpetualState.useContainer();
  const {
    loading: uniLoading,
    error: uniError,
    data: uniData,
  } = UniswapGetPair.useContainer();

  console.log({ data, error, uniData, uniLoading, uniError });

  // Show loading when we dont have all our info yet
  if (error || !data || uniLoading || uniError) {
    return <PerpetualInfoLoading />;
  }
  const priceIdentifier = parseBytes32String(data.priceIdentifier);
  const fairValue = calculateFairValue(
    data?.fundingRate?.rate,
    uniData?.pair?.token0Price
  ).toString();

  console.log({ priceIdentifier, fairValue });
  return (
    <PerpetualInfoView
      marketPrice={[
        (uniData?.pair?.token0Price || "").slice(0, 8),
        priceIdentifier,
      ]}
      fundingRate={[
        fromWei(data?.fundingRate?.rate.toString()) + "%",
        priceIdentifier,
      ]}
      fairValue={[fairValue, priceIdentifier]}
    />
  );
}
