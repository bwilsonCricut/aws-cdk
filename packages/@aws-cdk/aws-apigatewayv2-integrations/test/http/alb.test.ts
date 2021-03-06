import '@aws-cdk/assert/jest';
import { HttpApi, HttpMethod, HttpRoute, HttpRouteKey, VpcLink } from '@aws-cdk/aws-apigatewayv2';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as elbv2 from '@aws-cdk/aws-elasticloadbalancingv2';
import { Stack } from '@aws-cdk/core';
import { HttpAlbIntegration } from '../../lib';

describe('HttpAlbIntegration', () => {
  test('default', () => {
    // GIVEN
    const stack = new Stack();
    const vpc = new ec2.Vpc(stack, 'VPC');
    const lb = new elbv2.ApplicationLoadBalancer(stack, 'lb', { vpc });
    const listener = lb.addListener('listener', { port: 80 });
    listener.addTargets('target', { port: 80 });

    // WHEN
    const api = new HttpApi(stack, 'HttpApi');
    new HttpRoute(stack, 'HttpProxyPrivateRoute', {
      httpApi: api,
      integration: new HttpAlbIntegration({
        listener,
      }),
      routeKey: HttpRouteKey.with('/pets'),
    });

    // THEN
    expect(stack).toHaveResource('AWS::ApiGatewayV2::Integration', {
      IntegrationType: 'HTTP_PROXY',
      ConnectionId: {
        Ref: 'HttpApiVpcLink159804837',
      },
      ConnectionType: 'VPC_LINK',
      IntegrationMethod: 'ANY',
      IntegrationUri: {
        Ref: 'lblistener657ADDEC',
      },
      PayloadFormatVersion: '1.0',
    });
  });

  test('able to add a custom vpcLink', () => {
    // GIVEN
    const stack = new Stack();
    const vpc = new ec2.Vpc(stack, 'VPC');
    const vpcLink = new VpcLink(stack, 'VpcLink', { vpc });
    const lb = new elbv2.ApplicationLoadBalancer(stack, 'lb', { vpc });
    const listener = lb.addListener('listener', { port: 80 });
    listener.addTargets('target', { port: 80 });

    // WHEN
    const api = new HttpApi(stack, 'HttpApi');
    new HttpRoute(stack, 'HttpProxyPrivateRoute', {
      httpApi: api,
      integration: new HttpAlbIntegration({
        vpcLink,
        listener,
      }),
      routeKey: HttpRouteKey.with('/pets'),
    });

    // THEN
    expect(stack).toHaveResource('AWS::ApiGatewayV2::Integration', {
      IntegrationType: 'HTTP_PROXY',
      ConnectionId: {
        Ref: 'VpcLink42ED6FF0',
      },
      ConnectionType: 'VPC_LINK',
      IntegrationMethod: 'ANY',
      IntegrationUri: {
        Ref: 'lblistener657ADDEC',
      },
      PayloadFormatVersion: '1.0',
    });
  });

  test('method option is correctly recognized', () => {
    // GIVEN
    const stack = new Stack();
    const vpc = new ec2.Vpc(stack, 'VPC');
    const lb = new elbv2.ApplicationLoadBalancer(stack, 'lb', { vpc });
    const listener = lb.addListener('listener', { port: 80 });
    listener.addTargets('target', { port: 80 });

    // WHEN
    const api = new HttpApi(stack, 'HttpApi');
    new HttpRoute(stack, 'HttpProxyPrivateRoute', {
      httpApi: api,
      integration: new HttpAlbIntegration({
        listener,
        method: HttpMethod.PATCH,
      }),
      routeKey: HttpRouteKey.with('/pets'),
    });

    // THEN
    expect(stack).toHaveResource('AWS::ApiGatewayV2::Integration', {
      IntegrationMethod: 'PATCH',
    });
  });
});
