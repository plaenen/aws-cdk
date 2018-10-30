import { expect, haveResource } from '@aws-cdk/assert';
import ec2 = require('@aws-cdk/aws-ec2');
import cdk = require('@aws-cdk/cdk');
import { Test } from 'nodeunit';
import ecs = require('../../lib');

export = {
  "When creating a Fargate Service": {
    "with only required properties set, it correctly sets default properties"(test: Test) {
      // GIVEN
      const stack = new cdk.Stack();
      const vpc = new ec2.VpcNetwork(stack, 'MyVpc', {});
      const cluster = new ecs.FargateCluster(stack, 'FargateCluster', { vpc });
      const taskDefinition = new ecs.FargateTaskDefinition(stack, 'FargateTaskDef');

      taskDefinition.addContainer("web", {
        image: ecs.DockerHub.image("amazon/amazon-ecs-sample"),
      });

      new ecs.FargateService(stack, "FargateService", {
        cluster,
        taskDefinition
      });

      // THEN
      expect(stack).to(haveResource("AWS::ECS::Service", {
        TaskDefinition: {
          Ref: "FargateTaskDefC6FB60B4"
        },
        Cluster: {
          Ref: "FargateCluster7CCD5F93"
        },
        DeploymentConfiguration: {
          MaximumPercent: 200,
          MinimumHealthyPercent: 50
        },
        DesiredCount: 1,
        LaunchType: "FARGATE",
        LoadBalancers: [],
        NetworkConfiguration: {
          AwsvpcConfiguration: {
            AssignPublicIp: "DISABLED",
            SecurityGroups: [
              {
                "Fn::GetAtt": [
                  "FargateServiceSecurityGroup0A0E79CB",
                  "GroupId"
                ]
              }
            ],
            Subnets: [
              {
                Ref: "MyVpcPrivateSubnet1Subnet5057CF7E"
              },
              {
                Ref: "MyVpcPrivateSubnet2Subnet0040C983"
              },
              {
                Ref: "MyVpcPrivateSubnet3Subnet772D6AD7"
              }
            ]
          }
        }
      }));

      expect(stack).to(haveResource("AWS::EC2::SecurityGroup", {
        GroupDescription: "FargateService/SecurityGroup",
        SecurityGroupEgress: [
          {
            CidrIp: "0.0.0.0/0",
            Description: "Allow all outbound traffic by default",
            IpProtocol: "-1"
          }
        ],
        SecurityGroupIngress: [],
        VpcId: {
          Ref: "MyVpcF9F0CA6F"
        }
      }));

      test.done();
    },

    "allows specifying assignPublicIP as enabled"(test: Test) {
      // GIVEN
      const stack = new cdk.Stack();
      const vpc = new ec2.VpcNetwork(stack, 'MyVpc', {});
      const cluster = new ecs.FargateCluster(stack, 'FargateCluster', { vpc });
      const taskDefinition = new ecs.FargateTaskDefinition(stack, 'FargateTaskDef');

      taskDefinition.addContainer("web", {
        image: ecs.DockerHub.image("amazon/amazon-ecs-sample"),
      });

      new ecs.FargateService(stack, "FargateService", {
        cluster,
        taskDefinition,
        assignPublicIp: true

      });

      // THEN
      expect(stack).to(haveResource("AWS::ECS::Service", {
        NetworkConfiguration: {
          AwsvpcConfiguration: {
            AssignPublicIp: "ENABLED",
          }
        }
      }));

      test.done();
    },
  }
};