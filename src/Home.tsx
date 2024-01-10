import { useCallback } from "react";
import { Paper, Snackbar, LinearProgress } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import { DefaultCandyGuardRouteSettings, Nft } from "@metaplex-foundation/js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import confetti from "canvas-confetti";
import Link from "next/link";
import Countdown from "react-countdown";

import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { GatewayProvider } from "@civic/solana-gateway-react";
import { candyMachineId, defaultGuardGroup, network } from "./config";

import { MultiMintButton } from "./MultiMintButton";
//import { MintButton } from "./MintButton";
import {
  MintCount,
  Section,
  Container,
  Column,
} from "./styles";
import { AlertState } from "./utils";
import NftsModal from "./NftsModal";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import useCandyMachineV3 from "./hooks/useCandyMachineV3";
import {
  CustomCandyGuardMintSettings,
  NftPaymentMintSettings,
  ParsedPricesForUI,
} from "./hooks/types";
import { guardToLimitUtil } from "./hooks/utils";
import MintBtn from "./MintBtn";

const BorderLinearProgress = styled(LinearProgress)`
  height: 16px !important;
  border-radius: 30px;
  background-color: var(--alt-background-color) !important;
  > div.MuiLinearProgress-barColorPrimary{
    background-color: var(--primary) !important;
  }
  > div.MuiLinearProgress-bar1Determinate {
    border-radius: 30px !important;
    background-color: var(--primary);
  }
`;
const Header = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  width: 100%;

  @media only screen and (max-width: 450px) {
    top: 16px;
  }
`;
const WalletContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: right;
  margin: 30px;
  z-index: 999;
  position: relative;

  .wallet-adapter-dropdown-list {
    background: #ffffff;
  }
  .wallet-adapter-dropdown-list-item {
    background: #000000;
  }
  .wallet-adapter-dropdown-list {
    grid-row-gap: 5px;
  }
`;
const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 32px;
  width: 100%;
`
const Other = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 1rem;
  width: 100%;
`
const ImageWrap = styled.div`
  aspect-ratio: 1 / 1;
  width: 500px;
  max-width: 80vw;
  background-image: url(https://media.discordapp.net/attachments/1004085886058778756/1096416452162101289/0.png?width=610&height=610);
  background-size: cover;
  border-radius: 16px;
`
const Image = styled.div`
  height: 100%
  width: 100%;
`
const CollectionName = styled.h1`
  font-weight: 800;
  font-size: 64px;
  line-height: 100%;
  color: var(--white);

  @media only screen and (max-width: 1024px) {
    font-size: 48px;
  }

  @media only screen and (max-width: 450px) {
    font-size: 40px;
  }
`
const InfoRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0;
  gap: 16px;
  flex-wrap: wrap;
`
const InfoBox = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 10px 16px;
  gap: 8px;
  border: 2px solid #FFFFFF;
  border-radius: 4px;
  font-weight: 600;
  font-size: 20px;
  line-height: 100%;
  text-transform: uppercase;
  color: var(--white);

  @media only screen and (max-width: 450px) {
    font-size: 18px;
  }
`
const IconRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0px;
  gap: 24px;
  margin-bottom: -3px;
`
const CollectionDescription = styled.p`
  font-weight: 400;
  font-size: 20px;
  line-height: 150%;
  color: var(--white);
`
const MintedByYou = styled.span`
  font-style: italic;
  font-weight: 500;
  font-size: 16px;
  line-height: 100%;
  text-transform: none;
`
const ProgressbarWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 16px;
  width: 100%;
`
const StartTimer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 32px;
  gap: 48px;
  background: var(--alt-background-color);
  border-radius: 8px;
  @media only screen and (max-width: 450px) {
    gap: 16px;
    padding: 16px;
    width: -webkit-fill-available;
    justify-content: space-between;
  }
`
const StartTimerInner = styled(Paper)`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0px;
  gap: 16px;
  min-width: 90px;
  border-radius: 0px !important;
  box-shadow: none !important;
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 100%;
  background: none !important;
  text-transform: uppercase;
  color: var(--white);
  span {
    font-style: normal;
    font-weight: 800;
    font-size: 48px;
    line-height: 100%;
  }

  @media only screen and (max-width: 450px) {
    min-width: 70px;
    span {
      font-size: 32px;
    }
  }
`;
const StartTimerWrap = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: start;
  padding: 0px;
  gap: 16px;
  width: -webkit-fill-available;
`
const StartTimerSubtitle = styled.p`
  font-style: normal;
  font-weight: 600;
  font-size: 20px;
  line-height: 100%;
  text-transform: uppercase;
  color: #FFFFFF;
`
const PrivateWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 8px;
  width: -webkit-fill-available;
`
const PrivateText = styled.h2`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 16px 24px;
  gap: 10px;
  background: var(--error);
  border-radius: 4px;
  font-style: normal;
  font-weight: 600;
  font-size: 20px;
  line-height: 150%;
  text-transform: uppercase;
  color: var(--white);
  width: -webkit-fill-available;
`
const PrivateSubtext = styled.p`
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 150%;
  color: var(--white);
`
const WalletAmount = styled.div`
  color: var(--white);
  width: auto;
  padding: 8px 8px 8px 16px;
  min-width: 48px;
  min-height: auto;
  border-radius: 5px;
  background-color: var(--primary);
  box-sizing: border-box;
  transition: background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
    box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
    border 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
  font-weight: 600;
  line-height: 100%;
  text-transform: uppercase;
  border: 0;
  margin: 0;
  display: inline-flex;
  outline: 0;
  position: relative;
  align-items: center;
  user-select: none;
  vertical-align: middle;
  justify-content: flex-start;
  gap: 10px;
`;

const Wallet = styled.ul`
  flex: 0 0 auto;
  margin: 0;
  padding: 0;
`;

const ConnectButton = styled(WalletMultiButton)`
  border-radius: 5px !important;
  padding: 6px 16px;
  background-color: #fff;
  color: #000;
  margin: 0 auto;
`;
const ConnectWallet = styled(WalletMultiButton)`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 18px 24px;
  gap: 10px;
  width: 100%;
  height: fit-content;
  background-color: var(--primary) !important;
  border-radius: 4px;
  font-style: normal;
  font-weight: 600;
  font-size: 20px;
  line-height: 150%;
  text-transform: uppercase;
  color: var(--white) !important;
  transition: 0.2s;
  :hover {
    background-color: var(--primary) !important;
    color: var(--white) !important;
    opacity: 0.9;
  }
`

export interface HomeProps {
  candyMachineId: PublicKey;
}
const candyMachinOps = {
  allowLists: [
    {
      list: [
        "3dzNgBYqPUskVgzSwuWDNByvPBPVxoEBMt2TJeh1wVEA"
      ],
      groupLabel: "waoed",
    },
  ],
};
const Home = (props: HomeProps) => {
  const { connection } = useConnection();
  const wallet = useWallet();

  const [balance, setBalance] = useState<number>();
  const [mintedItems, setMintedItems] = useState<Nft[]>();

  const candyMachineV3 = useCandyMachineV3(
    props.candyMachineId,
    mintedItems?.length,
    candyMachinOps
  );

  const [alertState, setAlertState] = useState<AlertState>({
    open: false,
    message: "",
    severity: undefined,
  });

  const { guardLabel, guards, guardStates, prices } = useMemo(() => {
    const guardLabel = defaultGuardGroup;
    return {
      guardLabel,
      guards:
        candyMachineV3.guards[guardLabel] ||
        candyMachineV3.guards.default ||
        {},
      guardStates: candyMachineV3.guardStates[guardLabel] ||
        candyMachineV3.guardStates.default || {
        isStarted: true,
        isEnded: false,
        isLimitReached: false,
        canPayFor: 10,
        messages: [],
        isWalletWhitelisted: true,
        hasGatekeeper: false,
      },
      prices: candyMachineV3.prices[guardLabel] ||
        candyMachineV3.prices.default || {
        payment: [],
        burn: [],
        gate: [],
      },
    };
  }, [
    candyMachineV3.guards,
    candyMachineV3.guardStates,
    candyMachineV3.prices,
  ]);
  // useEffect(() => {
  //   console.log({ guardLabel, guards, guardStates, prices });
  // }, [guardLabel, guards, guardStates, prices]);
  useEffect(() => {
    (async () => {
      if (wallet?.publicKey) {
        const balance = await connection.getBalance(wallet.publicKey);
        setBalance(balance / LAMPORTS_PER_SOL);
      }
    })();
  }, [wallet, connection]);

  // useEffect(() => {
  //   if (mintedItems?.length !== 0) throwConfetti();
  // }, [mintedItems]);

  const openOnSolscan = useCallback((mint) => {
    window.open(
      `https://solscan.io/address/${mint}${[WalletAdapterNetwork.Devnet, WalletAdapterNetwork.Testnet].includes(
        network
      )
        ? `?cluster=${network}`
        : ""
      }`
    );
  }, []);

  const throwConfetti = useCallback(() => {
    confetti({
      particleCount: 400,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, [confetti]);

  const startMint = useCallback(
    async (quantityString: number = 1) => {
      const nftGuards: NftPaymentMintSettings[] = Array(quantityString)
        .fill(undefined)
        .map((_, i) => {
          return {
            burn: guards.burn?.nfts?.length
              ? {
                mint: guards.burn.nfts[i]?.mintAddress,
              }
              : undefined,
            payment: guards.payment?.nfts?.length
              ? {
                mint: guards.payment.nfts[i]?.mintAddress,
              }
              : undefined,
            gate: guards.gate?.nfts?.length
              ? {
                mint: guards.gate.nfts[i]?.mintAddress,
              }
              : undefined,
          };
        });

      console.log({ nftGuards });
      // debugger;
      candyMachineV3
        .mint(quantityString, {
          groupLabel: guardLabel,
          nftGuards,
        })
        .then((items) => {
          setMintedItems(items as any);
        })
        .catch((e) =>
          setAlertState({
            open: true,
            message: e.message,
            severity: "error",
          })
        );
    },
    [candyMachineV3.mint, guards]
  );

  useEffect(() => {
    console.log({ candyMachine: candyMachineV3.candyMachine });
  }, [candyMachineV3.candyMachine]);

  const solCost = useMemo(
    () =>
      prices
        ? prices.payment
          .filter(({ kind }) => kind === "sol")
          .reduce((a, { price }) => a + price, 0)
        : 0,
    [prices]
  );

  const tokenCost = useMemo(
    () =>
      prices
        ? prices.payment
          .filter(({ kind }) => kind === "token")
          .reduce((a, { price }) => a + price, 0)
        : 0,
    [prices]
  );

  let candyPrice = null;
  if (prices.payment.filter(({ kind }) => kind === "token").reduce((a, { kind }) => a + kind, "")) {
    candyPrice = `${tokenCost} Token`
  } else if (prices.payment.filter(({ kind }) => kind === "sol").reduce((a, { price }) => a + price, 0)) {
    candyPrice = `◎ ${solCost}`
  } else {
    candyPrice = "◎ 2"
  }

  console.log(candyPrice);
  // Icons
  const Globe = (props) => (
    <svg
      width={30}
      height={30}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M15 1.667A20.4 20.4 0 0 1 20.333 15 20.4 20.4 0 0 1 15 28.333m0-26.666A20.4 20.4 0 0 0 9.667 15 20.4 20.4 0 0 0 15 28.333m0-26.666C7.636 1.667 1.667 7.637 1.667 15c0 7.364 5.97 13.333 13.333 13.333m0-26.666c7.364 0 13.333 5.97 13.333 13.333 0 7.364-5.97 13.333-13.333 13.333M2.333 11h25.334M2.333 19h25.334"
        stroke="#fff"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
  const Twitter = (props) => (
    <svg
      width={28}
      height={23}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M8.789 23c-3.235 0-6.25-.94-8.789-2.564 2.155.14 5.958-.195 8.324-2.451-3.559-.163-5.164-2.893-5.373-4.059.302.117 1.744.257 2.558-.07C1.416 12.83.788 9.237.927 8.141c.768.536 2.07.723 2.582.676-3.814-2.729-2.442-6.834-1.767-7.72 2.737 3.792 6.84 5.922 11.914 6.04a5.866 5.866 0 0 1-.146-1.305C13.51 2.61 16.113 0 19.325 0a5.79 5.79 0 0 1 4.25 1.853c1.122-.263 2.81-.878 3.634-1.41-.416 1.493-1.71 2.738-2.493 3.2.006.016-.007-.016 0 0 .688-.104 2.549-.462 3.284-.96-.364.838-1.736 2.233-2.862 3.013C25.348 14.938 18.276 23 8.788 23Z"
        fill="#fff"
      />
    </svg>
  )
  const Discord = (props) => (
    <svg
      width={28}
      height={21}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M24.532 2.66C22.605.98 20.294.14 17.853 0l-.385.42c2.183.56 4.11 1.68 5.908 3.22-2.183-1.26-4.624-2.1-7.193-2.38-.77-.14-1.412-.14-2.183-.14-.77 0-1.413 0-2.184.14-2.568.28-5.009 1.12-7.192 2.38C6.422 2.1 8.349.98 10.532.42L10.147 0c-2.44.14-4.753.98-6.68 2.66C1.285 7.14.129 12.18 0 17.36 1.927 19.6 4.624 21 7.45 21c0 0 .899-1.12 1.54-2.1-1.669-.42-3.21-1.4-4.238-2.94.9.56 1.798 1.12 2.698 1.54 1.155.56 2.311.84 3.467 1.12 1.028.14 2.056.28 3.083.28 1.027 0 2.055-.14 3.083-.28 1.155-.28 2.312-.56 3.468-1.12.899-.42 1.798-.98 2.697-1.54-1.028 1.54-2.57 2.52-4.239 2.94.642.98 1.541 2.1 1.541 2.1 2.826 0 5.523-1.4 7.45-3.64-.128-5.18-1.284-10.22-3.468-14.7ZM9.762 14.84c-1.285 0-2.44-1.26-2.44-2.8 0-1.54 1.155-2.8 2.44-2.8 1.284 0 2.44 1.26 2.44 2.8 0 1.54-1.156 2.8-2.44 2.8Zm8.476 0c-1.284 0-2.44-1.26-2.44-2.8 0-1.54 1.156-2.8 2.44-2.8 1.285 0 2.44 1.26 2.44 2.8 0 1.54-1.155 2.8-2.44 2.8Z"
        fill="#fff"
      />
    </svg>
  )


  const Magiceden = () => {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        width={28}
        height={21}
        data-name="Layer 1"
        viewBox="0 0 479.37 303.2"
      >
        <image
          width="400"
          height="253"
          transform="scale(1.2)"
          xlinkHref="data:image/png;base64,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"
        ></image>
      </svg>
    );
  }
  const EvolveBabyBunnyLabel = () => {
    return (
      <div>Evolve Baby Bunny <a href="https://magiceden.io/marketplace/buffbunnybaby" target="_blank" rel="noopener noreferrer"><Magiceden></Magiceden></a></div >
    )
  }

  return (
    <main>
      <>
        <Header>
          <WalletContainer>
            <Wallet>
              {wallet ? (
                <WalletAmount>
                  {(balance || 0).toLocaleString()} SOL
                  <ConnectButton />
                </WalletAmount>
              ) : (
                <ConnectButton>Connect Wallet</ConnectButton>
              )}
            </Wallet>
          </WalletContainer>
        </Header>
        <Section>
          <Container>
            <Column>
              <ImageWrap>
                <Image>

                </Image>
              </ImageWrap>
            </Column>
            <Column>
              <Content>
                <CollectionName>Adult Buff Bunny</CollectionName>
                <InfoRow>
                  <IconRow>
                    <a href="https://buffbunny.net/" target="_blank" rel="noopener noreferrer"><Globe></Globe></a>
                    <a href="https://twitter.com/BuffBunnyNFT" target="_blank" rel="noopener noreferrer"><Twitter></Twitter></a>
                    <a href="https://discord.gg/Upv6S2YUaQ" target="_blank" rel="noopener noreferrer"><Discord></Discord></a>

                    <a href="https://magiceden.io/marketplace/teens_bunny" target="_blank" rel="noopener noreferrer"><Magiceden></Magiceden></a>

                  </IconRow>
                </InfoRow>
                <CollectionDescription>The Adult Buff Bunny is a collection with a total supply of 5,000 NFTs integrated with the Solana blockchain. The evolution is performed in different stages starting from baby bunny.</CollectionDescription>
              </Content>
              <Other>
                <ProgressbarWrap>
                  {wallet.publicKey && (
                    <MintCount>
                      Total minted {candyMachineV3.items.redeemed ? candyMachineV3.items.redeemed + 0 : 0}/
                      {candyMachineV3.items.available ? candyMachineV3.items.available + 0 : 0}{" "}
                      {(guards?.mintLimit?.mintCounter?.count ||
                        guards?.mintLimit?.settings?.limit) && (
                          <MintedByYou>
                            <>
                              ({guards?.mintLimit?.mintCounter?.count || "0"}
                              {guards?.mintLimit?.settings?.limit && (
                                <>/{guards?.mintLimit?.settings?.limit} </>
                              )}
                              by you)
                            </>
                          </MintedByYou>
                        )}
                    </MintCount>
                  )}
                  {wallet.publicKey && (
                    <div className="w-100">
                      <BorderLinearProgress variant="determinate" value={((candyMachineV3.items.redeemed ? candyMachineV3.items.redeemed + 0 : 0) * 100 / (candyMachineV3.items.available ? candyMachineV3.items.available + 0 : 0))}></BorderLinearProgress>
                    </div>
                  )}
                </ProgressbarWrap>
                {[{
                  label: '_',
                  visible: 'Evolve Teens Bunny'
                },
                {
                  label: 'free',
                  visible: 'Team Mint'
                }
              ].map((x, i) => {
                  // @ts-ignore
                  return (<MintBtn index={i} key={i} candyMachineId={candyMachineId} label={x.label} visible={x.visible} />)
                })}


                <NftsModal
                  openOnSolscan={openOnSolscan}
                  mintedItems={mintedItems || []}
                  setMintedItems={setMintedItems}
                />
              </Other>
            </Column>
          </Container>
        </Section>
      </>
      <Snackbar
        open={alertState.open}
        autoHideDuration={6000}
        onClose={() => setAlertState({ ...alertState, open: false })}
      >
        <Alert
          onClose={() => setAlertState({ ...alertState, open: false })}
          severity={alertState.severity}
        >
          {alertState.message}
        </Alert>
      </Snackbar>
    </main>
  );
};

export default Home;
const renderGoLiveDateCounter = ({ days, hours, minutes, seconds }: any) => {
  return (
    <StartTimerWrap>
      <StartTimerSubtitle>Mint opens in:</StartTimerSubtitle>
      <StartTimer>
        <StartTimerInner elevation={1}>
          <span>{days}</span>Days
        </StartTimerInner>
        <StartTimerInner elevation={1}>
          <span>{hours}</span>
          Hours
        </StartTimerInner>
        <StartTimerInner elevation={1}>
          <span>{minutes}</span>Mins
        </StartTimerInner>
        <StartTimerInner elevation={1}>
          <span>{seconds}</span>Secs
        </StartTimerInner>
      </StartTimer>
    </StartTimerWrap>
  );
};
