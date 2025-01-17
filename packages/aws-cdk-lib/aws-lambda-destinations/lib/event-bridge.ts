import * as events from '../../aws-events';
import * as lambda from '../../aws-lambda';
import { Stack } from '../../core';
import { Construct } from 'constructs';

/**
 * Use an Event Bridge event bus as a Lambda destination.
 *
 * If no event bus is specified, the default event bus is used.
 */
export class EventBridgeDestination implements lambda.IDestination {
  /**
   * @default - use the default event bus
   */
  constructor(private readonly eventBus?: events.IEventBus) {
  }

  /**
   * Returns a destination configuration
   */
  public bind(_scope: Construct, fn: lambda.IFunction, _options?: lambda.DestinationOptions): lambda.DestinationConfig {
    if (this.eventBus) {
      this.eventBus.grantPutEventsTo(fn);

      return {
        destination: this.eventBus.eventBusArn,
      };
    }

    const existingDefaultEventBus = _scope.node.tryFindChild('DefaultEventBus');
    let eventBus = (existingDefaultEventBus as events.EventBus) || events.EventBus.fromEventBusArn(_scope, 'DefaultEventBus', Stack.of(fn).formatArn({
      service: 'events',
      resource: 'event-bus',
      resourceName: 'default',
    }));

    eventBus.grantPutEventsTo(fn);

    return {
      destination: eventBus.eventBusArn,
    };
  }
}
