// lib/my-eks-blueprints-stack.ts
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as blueprints from '@aws-quickstart/eks-blueprints';
export default class ClusterConstruct extends Construct {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id);
    const hostedZoneID = 'fillme';
    const hostedZoneDomain = 'fill.me';

    const account = props?.env?.account!;
    const region = props?.env?.region!;
    const addOns: Array<blueprints.ClusterAddOn> = [
      new blueprints.addons.ArgoCDAddOn(),// Argocd already installed
      new blueprints.addons.CalicoOperatorAddOn(),// CNI driver
      new blueprints.addons.MetricsServerAddOn(),// allow cluster monitoring
      new blueprints.addons.ClusterAutoScalerAddOn(), // autoscaling of nodes
      new blueprints.addons.AwsLoadBalancerControllerAddOn(), // allow ALB as ingress
      new blueprints.addons.VpcCniAddOn(),// VPC CNI integration
      new blueprints.addons.ExternalsSecretsAddOn({}),// allow to use AWS secret as k8s secret (ie: licenses)
      new blueprints.ExternalDnsAddOn({ // allow to add a proper dns name from an hosted zone to an ALB ingress for example
        hostedZoneResources: [ blueprints.GlobalResources.HostedZone ]
      }),
      new blueprints.addons.EbsCsiDriverAddOn(),// allow EBS as PV
      new blueprints.addons.CoreDnsAddOn(), // internal DNS
      new blueprints.addons.KubeProxyAddOn() // kubeproxy
  ];
  
    const blueprint = blueprints.EksBlueprint.builder()
    .account(account)
    .region(region)
    .resourceProvider(blueprints.GlobalResources.HostedZone, new blueprints.ImportHostedZoneProvider(hostedZoneID, hostedZoneDomain))
    .addOns(...addOns)
    .teams()
    .build(scope, id+'-davidro-stack');


    cdk.Tags.of(blueprint).add("jfrog:owner", 'davidro');
    cdk.Tags.of(blueprint).add("jfrog:team", "devopsacc");
  
  }
}
