// lib/my-eks-blueprints-stack.ts
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as blueprints from '@aws-quickstart/eks-blueprints';
import { aws_ec2 as ec2 } from "aws-cdk-lib";
import { aws_eks as eks } from "aws-cdk-lib";
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
  // allow to customize the cluster 
  const clusterProps: blueprints.MngClusterProviderProps = {
    minSize: 1,
    maxSize: 6,
    desiredSize: 2,
    instanceTypes: [new ec2.InstanceType('m5.xlarge')],
    amiType: eks.NodegroupAmiType.AL2_X86_64,
    nodeGroupCapacityType: eks.CapacityType.ON_DEMAND,
    version: eks.KubernetesVersion.V1_24
  }
  const clusterProvider = new blueprints.MngClusterProvider(clusterProps);

    const blueprint = blueprints.EksBlueprint.builder()
    .account(account)
    .clusterProvider(clusterProvider)
    .region(region)
    .resourceProvider(blueprints.GlobalResources.HostedZone, new blueprints.ImportHostedZoneProvider(hostedZoneID, hostedZoneDomain))
    .addOns(...addOns)
    .teams()
    .build(scope, id+'-davidro-stack');

    cdk.Tags.of(blueprint).add("jfrog:owner", 'davidro');
    cdk.Tags.of(blueprint).add("jfrog:team", "devopsacc");
  
  }
}
