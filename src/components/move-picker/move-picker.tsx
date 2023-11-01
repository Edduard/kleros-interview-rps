import React, {useCallback, useEffect, useRef, useState} from "react";
import "./move-picker.scss";
import {Move, availableMoves} from "../../utils/constants/constants";

const aBeatsB = (a: number, b: number) => {
  if (a % 2 === b % 2) return a < b;
  else return a > b;
};

const getItemColor = (currentItem: number, selectedItem: number) => {
  if (currentItem === selectedItem) return "#ff6847";
  if (aBeatsB(currentItem, selectedItem)) return "red";
  if (aBeatsB(selectedItem, currentItem)) return "lime";
  return "#E9E9E9";
};

const getLineColor = (startItem: number, endItem: number, selectedItem?: number) => {
  if (!selectedItem) return "#ff6847";
  else {
    if (startItem === selectedItem && aBeatsB(selectedItem, endItem)) return "lime";
    if (endItem === selectedItem && aBeatsB(startItem, selectedItem)) return "red";
    return "#E9E9E9";
  }
};

const MovePicker = React.memo(({onSelect = (index: number) => {}}: {onSelect: (...args: any) => any}) => {
  const itemsContainerRef = useRef<any>();
  const itemsRef = useRef<Array<HTMLDivElement | null>>([]);
  const arrowContainerRef = useRef<any>();
  const [selectedItem, setSelectedItem] = useState(0);

  const positionItems = useCallback(
    (selectedItem: number) => {
      const centerX = itemsContainerRef.current.clientWidth / 2;
      const centerY = itemsContainerRef.current.clientWidth / 2;
      const radius = Math.min(centerX, centerY) * 0.6; // 60% of the smallest dimension

      itemsRef.current.forEach((item: HTMLDivElement | null, i: number) => {
        if (item) {
          const angle = (i / 5) * 2 * Math.PI;
          const x = centerX + radius * Math.sin(angle);
          const y = centerY - radius * Math.cos(angle);
          item.style.left = `${x}px`;
          item.style.top = `${y}px`;

          if (selectedItem) {
            if (i + 1 === selectedItem) {
              item.style.background = "#ffbaaa";
              item.style.border = `12px solid #ff6847`;
            } else {
              item.style.border = `2px solid ${getItemColor(i + 1, selectedItem)}`;
              item.style.background = "white";
            }
          }
        }
      });
    },
    [itemsRef]
  );

  const drawLines = useCallback(
    (selectedItem?: number) => {
      arrowContainerRef.current.innerHTML = "";

      itemsRef.current.forEach((startItem, i) => {
        itemsRef.current.forEach((endItem, j) => {
          if (startItem && endItem && aBeatsB(i, j)) {
            const startX = startItem.offsetLeft;
            const startY = startItem.offsetTop;
            const endX = endItem.offsetLeft;
            const endY = endItem.offsetTop;
            const midX = (startX + endX) / 2;
            const midY = (startY + endY) / 2;

            // Add the definition of the arrow head
            //
            const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");

            const marker = document.createElementNS("http://www.w3.org/2000/svg", "marker");
            marker.id = `arrowhead-${i}-${j}`;
            marker.setAttribute("markerWidth", "10");
            marker.setAttribute("markerHeight", "7");
            marker.setAttribute("refX", "0");
            marker.setAttribute("refY", "3.5");
            marker.setAttribute("orient", "auto");
            marker.setAttribute("fill", getLineColor(i + 1, j + 1, selectedItem));

            const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
            polygon.setAttribute("points", "0 0, 10 3.5, 0 7");

            marker.appendChild(polygon);
            defs.appendChild(marker);
            arrowContainerRef.current.appendChild(defs);

            const line = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
            // line.setAttribute("x1", startX.toString());
            // line.setAttribute("y1", startY.toString());
            // line.setAttribute("x2", endX.toString());
            // line.setAttribute("y2", endY.toString());

            line.setAttribute("points", `${startX}, ${startY}, ${midX}, ${midY}, ${endX}, ${endY}`);

            line.setAttribute("stroke", getLineColor(i + 1, j + 1, selectedItem));
            line.setAttribute("stroke-width", "2");
            line.setAttribute(`marker-mid`, `url(#arrowhead-${i}-${j})`);
            arrowContainerRef.current.appendChild(line);
          }
        });
      });
    },
    [itemsRef]
  );

  useEffect(() => {
    positionItems(selectedItem);
    drawLines(selectedItem);
    onSelect(selectedItem);
  }, [positionItems, drawLines, selectedItem, onSelect]);

  const handleSelectItem = (move: Move, index: number) => {
    setSelectedItem(move.value);
  };

  useEffect(() => {
    console.log("MovePicker rerender");
  });

  return (
    <div ref={itemsContainerRef} className="move-picker-container">
      <svg ref={arrowContainerRef} className="arrows-container" width="100%" height="100%"></svg>
      {availableMoves.map((move: Move, index: number) => {
        return (
          <div
            className="move-item-container"
            onClick={() => handleSelectItem(move, index)}
            key={`move-item-container-${index}`}
            ref={(el) => (itemsRef.current[index] = el)}>
            <img src={move.imageSrc} alt={move.name} className="available-move-item" />
          </div>
        );
      })}
    </div>
  );
});

export default MovePicker;
