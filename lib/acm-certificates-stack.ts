// lib/my-eks-blueprints-stack.ts
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_certificatemanager as acm } from "aws-cdk-lib";
import { aws_route53 as route53 } from "aws-cdk-lib";
export default class CertificateStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);
        const devopsaccTeamZone = route53.HostedZone.fromLookup(this, 'Zone', {domainName : 'devopsacc.team'});
    
    
        const cert = new acm.Certificate(this, 'Certificate', {
          domainName: 'dro-swamp1.devopsacc.team',
          subjectAlternativeNames: ['dro-swamp2.devopsacc.team',
           'dro-swamp2.devopsacc.team',
           'dro-swamp3.devopsacc.team',
           'dro-swamp4.devopsacc.team',
           'dro-swamp5.devopsacc.team',
           'dro-swamp6.devopsacc.team',
           'dro-swamp7.devopsacc.team',
           'dro-swamp8.devopsacc.team'],
          validation: acm.CertificateValidation.fromDns(devopsaccTeamZone),
        });
        cdk.Tags.of(cert).add("jfrog:owner", 'davidro');
        cdk.Tags.of(cert).add("jfrog:team", "devopsacc");
        new cdk.CfnOutput(this, 'Certificate ARN', { value: cert.certificateArn });
       
    }
}