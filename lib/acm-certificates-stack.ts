// lib/my-eks-blueprints-stack.ts
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_certificatemanager as acm } from "aws-cdk-lib";
import { aws_route53 as route53 } from "aws-cdk-lib";
export default class CertificateStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);
        const hostedZoneDomain = this.node.tryGetContext('hostedZoneDomain');

        const devopsaccTeamZone = route53.HostedZone.fromLookup(this, 'Zone', {domainName : hostedZoneDomain});

    
        const cert = new acm.Certificate(this, 'Certificate', {
          domainName: `demo-env.${hostedZoneDomain}`,
          subjectAlternativeNames: [`*.demo-env.${hostedZoneDomain}`
        ],
          validation: acm.CertificateValidation.fromDns(devopsaccTeamZone),
        });
        cdk.Tags.of(cert).add("Owner", 'davidro');
        cdk.Tags.of(cert).add("Team", "DevAcc");  
        cdk.Tags.of(cert).add("Purpose", "Demo");  
        cdk.Tags.of(cert).add("Customer", "BNP Paribas");  
        cdk.Tags.of(cert).add("Notes", "self hosted wildcard cert stack"); 
        new cdk.CfnOutput(this, 'Certificate ARN', { value: cert.certificateArn });
       
    }
}