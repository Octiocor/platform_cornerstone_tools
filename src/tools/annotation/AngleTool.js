import external from './../../externalModules.js';
import BaseAnnotationTool from '../base/BaseAnnotationTool.js';
// State
import {
  addToolState,
  getToolState,
  removeToolState,
} from './../../stateManagement/toolState.js';
import toolStyle from './../../stateManagement/toolStyle.js';
import toolColors from './../../stateManagement/toolColors.js';
// Manipulators
import { moveNewHandle } from './../../manipulators/index.js';
// Drawing
import {
  getNewContext,
  draw,
  setShadow,
  drawJoinedLines,
} from './../../drawing/index.js';
import drawLinkedTextBox from './../../drawing/drawLinkedTextBox.js';
import { textBoxWidth } from './../../drawing/drawTextBox.js';
import drawHandles from './../../drawing/drawHandles.js';
import lineSegDistance from './../../util/lineSegDistance.js';
import roundToDecimal from './../../util/roundToDecimal.js';
import { angleCursor } from '../cursors/index.js';
import triggerEvent from '../../util/triggerEvent.js';
import EVENTS from '../../events.js';
import getPixelSpacing from '../../util/getPixelSpacing';
import throttle from '../../util/throttle';
import { getModule } from '../../store/index';

/**
 * @public
 * @class AngleTool
 * @memberof Tools.Annotation
 * @classdesc Create and position an angle by placing three consecutive points.
 * @extends Tools.Base.BaseAnnotationTool
 * @hideconstructor
 *
 * @param {ToolConfiguration} [props={}]
 */
export default class AngleTool extends BaseAnnotationTool {
  constructor(props = {}) {
    const defaultProps = {
      name: 'Angle',
      supportedInteractionTypes: ['Mouse', 'Touch'],
      svgCursor: angleCursor,
      configuration: {
        drawHandles: true,
        drawHandlesOnHover: false,
        hideHandlesIfMoving: false,
        renderDashed: false,
      },
    };

    super(props, defaultProps);

    this.preventNewMeasurement = false;

    this.throttledUpdateCachedStats = throttle(this.updateCachedStats, 110);
  }

  createNewMeasurement(eventData) {
    const measurementData = {
      visible: true,
      active: true,
      color: undefined,
      invalidated: true,
      clockwise: true,
      handles: {
        start: {
          x: eventData.currentPoints.image.x,
          y: eventData.currentPoints.image.y,
          highlight: true,
          active: false,
        },
        middle: {
          x: eventData.currentPoints.image.x,
          y: eventData.currentPoints.image.y,
          highlight: true,
          active: true,
        },
        end: {
          x: eventData.currentPoints.image.x,
          y: eventData.currentPoints.image.y,
          highlight: true,
          active: false,
        },
        textBox: {
          active: false,
          hasMoved: false,
          movesIndependently: false,
          drawnIndependently: true,
          allowedOutsideImage: true,
          hasBoundingBox: true,
        },
      },
    };
    return measurementData;
  }

  pointNearTool(element, data, coords) {
    if (data.visible === false) {
      return false;
    }

    return (
      lineSegDistance(
        element,
        data.handles.start,
        data.handles.middle,
        coords
      ) < 25 ||
      lineSegDistance(element, data.handles.middle, data.handles.end, coords) <
        25
    );
  }

  updateCachedStats(image, element, data) {
    const sideA = getSide(image, data.handles.middle, data.handles.start);
    const sideB = getSide(image, data.handles.end, data.handles.middle);
    const sideC = getSide(image, data.handles.end, data.handles.start);

    const sideALength = length(sideA);
    const sideBLength = length(sideB);
    const sideCLength = length(sideC);

    // Cosine law
    let angle = Math.acos(
      (Math.pow(sideALength, 2) +
        Math.pow(sideBLength, 2) -
        Math.pow(sideCLength, 2)) /
        (2 * sideALength * sideBLength)
    );

    angle *= 180 / Math.PI;

    // Calculate cross product to determine rotation direction
    const crossProduct = sideA.x * sideB.y - sideA.y * sideB.x;

    // Only set clockwise if it's undefined
    if (data.clockwise === undefined) {
      data.clockwise = crossProduct > 0;
    }

    // Calculate final angle based on clockwise property and cross product
    const shouldBeReflexAngle = data.clockwise
      ? crossProduct > 0
      : crossProduct < 0;
    if (shouldBeReflexAngle) {
      angle = 360 - angle;
    }

    data.rAngle = roundToDecimal(angle, 2);
    data.invalidated = false;
  }

  renderToolData(evt) {
    const eventData = evt.detail;
    const enabledElement = eventData.enabledElement;
    const {
      handleRadius,
      drawHandlesOnHover,
      hideHandlesIfMoving,
      renderDashed,
    } = this.configuration;
    const toolData = getToolState(evt.currentTarget, this.name);
    const lineDash = getModule('globalConfiguration').configuration.lineDash;

    if (!toolData) {
      return;
    }

    const context = getNewContext(eventData.canvasContext.canvas);
    const { image, element } = eventData;
    const { rowPixelSpacing, colPixelSpacing } = getPixelSpacing(image);

    const lineWidth = toolStyle.getToolWidth();

    for (let i = 0; i < toolData.data.length; i++) {
      const data = toolData.data[i];

      if (data.visible === false) {
        continue;
      }

      draw(context, context => {
        setShadow(context, this.configuration);

        const color = toolColors.getColorIfActive(data);
        const lineOptions = { color };

        if (renderDashed) {
          lineOptions.lineDash = lineDash;
        }

        // Draw the angle lines
        drawJoinedLines(
          context,
          eventData.element,
          data.handles.start,
          [data.handles.middle, data.handles.end],
          lineOptions
        );

        // Draw the angle arc
        const handleMiddleCanvas = external.cornerstone.pixelToCanvas(
          eventData.element,
          data.handles.middle
        );
        const handleStartCanvas = external.cornerstone.pixelToCanvas(
          eventData.element,
          data.handles.start
        );
        const handleEndCanvas = external.cornerstone.pixelToCanvas(
          eventData.element,
          data.handles.end
        );

        // Calculate vectors
        const startVector = {
          x: handleStartCanvas.x - handleMiddleCanvas.x,
          y: handleStartCanvas.y - handleMiddleCanvas.y,
        };
        const endVector = {
          x: handleEndCanvas.x - handleMiddleCanvas.x,
          y: handleEndCanvas.y - handleMiddleCanvas.y,
        };

        // Calculate cross product to determine actual angle direction
        const crossProduct =
          startVector.x * endVector.y - startVector.y * endVector.x;

        // Only set clockwise on initial render if it's undefined
        if (data.clockwise === undefined) {
          if (data.rAngle > 180) {
            data.clockwise = crossProduct < 0;
          } else {
            data.clockwise = crossProduct > 0;
          }
        }

        // Calculate start angle and angle range
        const startAngle = Math.atan2(startVector.y, startVector.x);
        const endAngle = Math.atan2(endVector.y, endVector.x);

        // Draw arc
        const arcRadius = 20;
        context.beginPath();
        context.arc(
          handleMiddleCanvas.x,
          handleMiddleCanvas.y,
          arcRadius,
          startAngle,
          endAngle,
          !data.clockwise
        );
        context.strokeStyle = color;
        context.stroke();

        // Draw the handles
        const handleOptions = {
          color,
          handleRadius,
          drawHandlesIfActive: drawHandlesOnHover,
          hideHandlesIfMoving,
        };

        if (this.configuration.drawHandles) {
          drawHandles(context, eventData, data.handles, handleOptions);
        }

        // Update textbox stats
        if (data.invalidated === true) {
          if (data.rAngle) {
            this.throttledUpdateCachedStats(image, element, data);
          } else {
            this.updateCachedStats(image, element, data);
          }
        }

        if (data.rAngle) {
          const text = textBoxText(data, rowPixelSpacing, colPixelSpacing);

          const distance = 15;

          let textCoords;

          if (!data.handles.textBox.hasMoved) {
            textCoords = {
              x: handleMiddleCanvas.x,
              y: handleMiddleCanvas.y,
            };

            const padding = 5;
            const textWidth = textBoxWidth(context, text, padding);

            if (handleMiddleCanvas.x < handleStartCanvas.x) {
              textCoords.x -= distance + textWidth + 10;
            } else {
              textCoords.x += distance;
            }

            const transform = external.cornerstone.internal.getTransform(
              enabledElement
            );

            transform.invert();

            const coords = transform.transformPoint(textCoords.x, textCoords.y);

            data.handles.textBox.x = coords.x;
            data.handles.textBox.y = coords.y;
          }

          drawLinkedTextBox(
            context,
            eventData.element,
            data.handles.textBox,
            text,
            data.handles,
            textBoxAnchorPoints,
            color,
            lineWidth,
            0,
            true
          );
        }
      });
    }

    function textBoxText(data, rowPixelSpacing, colPixelSpacing) {
      const suffix = !rowPixelSpacing || !colPixelSpacing ? ' (isotropic)' : '';
      const str = '00B0'; // Degrees symbol

      return (
        data.rAngle.toString() + String.fromCharCode(parseInt(str, 16)) + suffix
      );
    }

    function textBoxAnchorPoints(handles) {
      return [handles.start, handles.middle, handles.end];
    }
  }

  addNewMeasurement(evt, interactionType) {
    if (this.preventNewMeasurement) {
      return;
    }

    this.preventNewMeasurement = true;
    evt.preventDefault();
    evt.stopPropagation();

    const eventData = evt.detail;
    const measurementData = this.createNewMeasurement(eventData);
    const element = evt.detail.element;

    // Associate this data with this imageId so we can render it and manipulate it
    addToolState(element, this.name, measurementData);
    external.cornerstone.updateImage(element);

    // Step 1, create start and second middle.
    moveNewHandle(
      eventData,
      this.name,
      measurementData,
      measurementData.handles.middle,
      this.options,
      interactionType,
      success => {
        measurementData.active = false;

        if (!success) {
          removeToolState(element, this.name, measurementData);

          this.preventNewMeasurement = false;

          return;
        }

        measurementData.handles.end.active = true;

        external.cornerstone.updateImage(element);

        // Step 2, create end.
        moveNewHandle(
          eventData,
          this.name,
          measurementData,
          measurementData.handles.end,
          this.options,
          interactionType,
          success => {
            if (success) {
              measurementData.active = false;
              external.cornerstone.updateImage(element);
            } else {
              removeToolState(element, this.name, measurementData);
            }

            this.preventNewMeasurement = false;
            external.cornerstone.updateImage(element);

            const modifiedEventData = {
              toolName: this.name,
              toolType: this.name, // Deprecation notice: toolType will be replaced by toolName
              element,
              measurementData,
            };

            triggerEvent(
              element,
              EVENTS.MEASUREMENT_COMPLETED,
              modifiedEventData
            );
          }
        );
      }
    );
  }

  doubleClickCallback(evt) {
    const element = evt.detail.element;
    const coords = evt.detail.currentPoints.canvas;
    const toolState = getToolState(element, this.name);

    if (!toolState) {
      return false;
    }

    // Check if we clicked near any of our tools
    for (let i = 0; i < toolState.data.length; i++) {
      const data = toolState.data[i];
      if (this.pointNearTool(element, data, coords)) {
        data.clockwise = !data.clockwise;
        data.invalidated = true; // Allow recalculation with new clockwise value
        external.cornerstone.updateImage(element);
        return true;
      }
    }

    return false;
  }

  touchPressCallback(evt) {
    return this.doubleClickCallback(evt);
  }
}

function length(vector) {
  return Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2));
}

function getSide(image, handleEnd, handleStart) {
  const { rowPixelSpacing, colPixelSpacing } = getPixelSpacing(image);

  return {
    x: (handleEnd.x - handleStart.x) * (colPixelSpacing || 1),
    y: (handleEnd.y - handleStart.y) * (rowPixelSpacing || 1),
  };
}
