import styled from 'styled-components';

export const Section = styled('div')<any>`
  width: calc(100% - 64px);
  margin: auto;

  @media only screen and (max-width: 768px) {
    height: auto;
  }

  @media only screen and (max-width: 450px) {
    width:auto;
    padding: 32px 0;
  }
`
export const Container = styled('div')<any>`
  width: 100%;
  height: 100%;
  max-width: 1280px;
  margin-right: auto;
  margin-left: auto;
  padding: 0 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: row;
  gap: 1rem;
  padding:0px 0px 5rem 0px;
  
  @media only screen and (max-width: 1174px) {
    gap: 1rem;
  }

  @media only screen and (max-width: 1000px) {
    flex-direction: column;
  }

  @media only screen and (max-width: 450px) {
    padding: 0 16px;
    width: auto;
  }
`;
export const Column = styled('div')<any>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 1rem;
  height: 100%;
  margin: 0px 0.5rem;
  width: 500px;
  max-width: 80vw;

  @media only screen and (max-width: 450px) {
    gap: 1rem;
  }
`;
export const MintCount = styled('h3')`
  font-family: 'DM Sans';
  font-style: normal;
  font-weight: 600;
  font-size: 20px;
  line-height: 100%;
  text-transform: uppercase;
  color: var(--white);
`;
