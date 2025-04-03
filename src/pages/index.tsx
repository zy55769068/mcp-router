import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import Translate from '@docusaurus/Translate';
import styles from './index.module.css';

type FeatureItem = {
  title: ReactNode;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: <Translate id="homepage.feature1.title">Easy to Use</Translate>,
    description: (
      <Translate id="homepage.feature1.description">
        Docusaurus was designed from the ground up to be easily installed and
        used to get your website up and running quickly.
      </Translate>
    ),
  },
  {
    title: <Translate id="homepage.feature2.title">Token based authentication</Translate>,
    description: (
      <Translate id="homepage.feature2.description">
        Authenticate your apps with a token.
      </Translate>
    ),
  },
  {
    title: <Translate id="homepage.feature3.title">Powered by React</Translate>,
    description: (
      <Translate id="homepage.feature3.description">
        Extend or customize your website layout by reusing React. Docusaurus can
        be extended while reusing the same header and footer.
      </Translate>
    ),
  },
];

function Feature({title, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}


function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          <Translate id="homepage.header.title">{siteConfig.title}</Translate>
        </Heading>
        <p className="hero__subtitle">
          <Translate id="homepage.header.tagline">{siteConfig.tagline}</Translate>
        </p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro">
            <Translate id="homepage.header.tutorial.link">
              MCP Router Tutorial - 5min ⏱️
            </Translate>
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
