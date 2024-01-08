import { useState } from 'react';

// Rect class
class Rect {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  contains(r) {
    return (
      this.x <= r.x &&
      this.y <= r.y &&
      this.x + this.width >= r.x + r.width &&
      this.y + this.height >= r.y + r.height
    );
  }

  disjointFrom(r) {
    return (
      this.x + this.width <= r.x ||
      this.y + this.height <= r.y ||
      r.x + r.width <= this.x ||
      r.y + r.height <= this.y
    );
  }

  intersects(r) {
    return !this.disjointFrom(r);
  }

  copy() {
    return new Rect(this.x, this.y, this.width, this.height);
  }
}

// BinPacker class
class BinPacker {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.freeRectangles = [new Rect(0, 0, width, height)];
    this.positionedRectangles = [];
    this.unpositionedRectangles = [];
  }

insert(width, height) {
    const r = this.findPosition(width, height, this.freeRectangles);

    if (r.x === undefined) {
      const unpositioned = new Rect(undefined, undefined, width, height);
      this.unpositionedRectangles.push(unpositioned);
      return { positioned: false, rectangle: unpositioned };
    }

    let n = this.freeRectangles.length;
    for (let i = 0; i < n; i++) {
      const newRectangles = this.splitRectangle(this.freeRectangles[i], r);
      if (newRectangles) {
        this.freeRectangles.splice(i, 1);
        this.freeRectangles = this.freeRectangles.concat(newRectangles);
        --i;
        --n;
      }
    }

    this.pruneRectangles(this.freeRectangles);

    this.positionedRectangles.push(r);

    return { positioned: true, rectangle: r };
  }

  findPosition(width, height, F) {
    let bestRectangle = new Rect(undefined, undefined, width, height);
    let bestShortSideFit = Number.MAX_VALUE;
    let bestLongSideFit = Number.MAX_VALUE;

    for (let i = 0; i < F.length; i++) {
      let f = F[i];

      if (f.width >= width && f.height >= height) {
        let leftoverHorizontal = Math.abs(f.width - width);
        let leftoverVertical = Math.abs(f.height - height);

        let shortSideFit = Math.min(leftoverHorizontal, leftoverVertical);
        let longSideFit = Math.max(leftoverHorizontal, leftoverVertical);

        if (
          shortSideFit < bestShortSideFit ||
          (shortSideFit === bestShortSideFit && longSideFit < bestLongSideFit)
        ) {
          bestRectangle.x = f.x;
          bestRectangle.y = f.y;
          bestShortSideFit = shortSideFit;
          bestLongSideFit = longSideFit;
        }
      }
    }

    return bestRectangle;
  }

  splitRectangle(f, r) {
    if (r.disjointFrom(f)) return false;

    let newRectangles = [];

    if (r.x < f.x + f.width && f.x < r.x + r.width) {
      if (f.y < r.y && r.y < f.y + f.height) {
        let newRectangle = f.copy();
        newRectangle.height = r.y - newRectangle.y;
        newRectangles.push(newRectangle);
      }

      if (r.y + r.height < f.y + f.height) {
        let newRectangle = f.copy();
        newRectangle.y = r.y + r.height;
        newRectangle.height = f.y + f.height - (r.y + r.height);
        newRectangles.push(newRectangle);
      }
    }

    if (r.y < f.y + f.height && f.y < r.y + r.height) {
      if (f.x < r.x && r.x < f.x + f.width) {
        let newRectangle = f.copy();
        newRectangle.width = r.x - newRectangle.x;
        newRectangles.push(newRectangle);
      }

      if (r.x + r.width < f.x + f.width) {
        let newRectangle = f.copy();
        newRectangle.x = r.x + r.width;
        newRectangle.width = f.x + f.width - (r.x + r.width);
        newRectangles.push(newRectangle);
      }
    }

    return newRectangles;
  }

  pruneRectangles(F) {
    for (let i = 0; i < F.length; i++) {
      for (let j = i + 1; j < F.length; j++) {
        if (F[j].contains(F[i])) {
          F.splice(i, 1);
          i--;
          break;
        }
        if (F[i].contains(F[j])) {
          F.splice(j, 1);
          j--;
        }
      }
    }
  }
}

function getRandomColor() {
  return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
}

function App() {
  const [positionedRectangles, setPositionedRectangles] = useState([]);

  function handleInsert() {

      const binPacker = new BinPacker(800, 800);

    // Generate random width, height, and background color
    const width = Math.floor(Math.random() * 200) + 50;
    const height = Math.floor(Math.random() * 200) + 50;
    const bgColor = getRandomColor();

    // Perform insertions with random dimensions and color
    const insertionResult = binPacker.insert(width, height);
    if (insertionResult.positioned) {      
      setPositionedRectangles([...positionedRectangles, 
        ...binPacker.positionedRectangles,
        { x: insertionResult.rectangle.x, y: insertionResult.rectangle.y, width, height, bgColor },
      ]);
    } else {
      console.log('Rectangle could not be positioned:', insertionResult.rectangle);
    }
  }

 return (
    <div>
      <button onClick={handleInsert}>Insert Rectangle</button>
      <div style={{ position: 'relative', width: '800px', height: '800px', border: '1px solid black' }}>
        {positionedRectangles.map((rectangle, index) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: rectangle.x,
              top: rectangle.y,
              width: rectangle.width,
              height: rectangle.height,
              backgroundColor: rectangle.bgColor,
              border: '1px solid black',
            }}
          ></div>
        ))}
      </div>
    </div>
  );
}

export default App;
