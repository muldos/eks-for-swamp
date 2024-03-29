// bin/my-eks-blueprints.ts
import * as cdk from 'aws-cdk-lib';
import CertificateStack from '../lib/acm-certificates-stack';
import ClusterConstruct from '../lib/eks-swamp-env-stack';


const app = new cdk.App();
const account = process.env.CDK_DEFAULT_ACCOUNT!;
const region = process.env.CDK_DEFAULT_REGION;
const env = { account, region }

new ClusterConstruct(app, 'cluster', { env });
new CertificateStack(app, 'acmDemoEnv', { env });
