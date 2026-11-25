(function () {
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.documentElement.classList.add("js");

  var stepsEl = document.querySelector(".steps");
  if (stepsEl) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      stepsEl.classList.add("in");
    } else {
      new IntersectionObserver(function (entries, obs) {
        if (entries[0].isIntersecting) {
          stepsEl.classList.add("in");
          obs.disconnect();
        }
      }, { threshold: 0.25 }).observe(stepsEl);
    }
  }

  //zHULIDE.Code

  var header = document.querySelector(".nav");
  var toggle = document.getElementById("menu-toggle");
  var menu = document.getElementById("menu");

  function setMenu(open) {
    header.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", open);
    toggle.setAttribute("aria-label", open ? "Sluit menu" : "Open menu");
  }
  toggle.addEventListener("click", function () {
    setMenu(!header.classList.contains("open"));
  });
  menu.addEventListener("click", function (e) {
    if (e.target.closest("a")) setMenu(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setMenu(false);
  });

  function texture(w, h, draw) {
    var c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    draw(c.getContext("2d"), w, h);
    var t = new THREE.CanvasTexture(c);
    t.anisotropy = 4;
    return t;
  }
  function clamp01(v) { return Math.max(0, Math.min(1, v)); }
  function smooth(v) { v = clamp01(v); return v * v * (3 - 2 * v); }

  var canvas = document.getElementById("scene");
  var badge = document.getElementById("badge");
  if (canvas && window.THREE) {
    var hero = canvas.parentElement;
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    var scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0a1428, 28, 95);
    var camera = new THREE.PerspectiveCamera(45, 1, 0.5, 140);

    scene.add(new THREE.AmbientLight(0x9aa6bd, 0.8));
    var key = new THREE.DirectionalLight(0xffffff, 0.9);
    key.position.set(-5, 8, 8);
    scene.add(key);

    var ground = new THREE.Mesh(
      new THREE.PlaneGeometry(140, 140),
      new THREE.MeshStandardMaterial({ color: 0x0d1a38, roughness: 1 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.02;
    scene.add(ground);

    var starPos = new Float32Array(360 * 3);
    for (var s = 0; s < 360; s++) {
      var th = Math.random() * Math.PI * 2, ph = Math.random() * Math.PI * 0.48;
      starPos[s * 3] = 100 * Math.sin(ph) * Math.cos(th);
      starPos[s * 3 + 1] = 100 * Math.cos(ph);
      starPos[s * 3 + 2] = 100 * Math.sin(ph) * Math.sin(th);
    }
    var starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({
      color: 0xffffff, size: 1.6, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.75
    })));

    var skyMat = new THREE.MeshStandardMaterial({ color: 0x15264a, roughness: 1 });
    [14, 9, 19, 11, 21, 8, 16, 12, 18, 10, 20, 13, 9, 17].forEach(function (h, i) {
      var b = new THREE.Mesh(new THREE.BoxGeometry(5, h, 5), skyMat);
      b.position.set(-45 + i * 7, h / 2, -52 - (i % 3) * 6);
      scene.add(b);
    });

    var road = new THREE.Mesh(
      new THREE.PlaneGeometry(9, 56),
      new THREE.MeshStandardMaterial({ color: 0x1a2c58, roughness: 0.9 })
    );
    road.rotation.x = -Math.PI / 2;
    road.position.z = 1;
    scene.add(road);

    var dashMat = new THREE.MeshBasicMaterial({ color: 0xe7eaf0 });
    var edgeMat = new THREE.MeshBasicMaterial({ color: 0x8c97ab });
    var poleMat = new THREE.MeshStandardMaterial({ color: 0x2a3a5e });
    var lampMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    function flat(w, d, mat, x, z) {
      var m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat);
      m.rotation.x = -Math.PI / 2;
      m.position.set(x, 0.02, z);
      scene.add(m);
    }
    for (var z = 20; z >= -22; z -= 6) flat(0.22, 2.4, dashMat, 0, z);
    flat(0.12, 56, edgeMat, -4.3, 1);
    flat(0.12, 56, edgeMat, 4.3, 1);

    [14, 2, -10, -22].forEach(function (lz) {
      [-1, 1].forEach(function (side) {
        var pole = new THREE.Mesh(new THREE.BoxGeometry(0.12, 4.5, 0.12), poleMat);
        pole.position.set(side * 5.6, 2.25, lz);
        var arm = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.1, 0.1), poleMat);
        arm.position.set(side * 5.6 - side * 0.5, 4.5, lz);
        var lamp = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.08, 0.25), lampMat);
        lamp.position.set(side * 5.6 - side, 4.45, lz);
        scene.add(pole, arm, lamp);
      });
    });

    var BAY_X = 2.6, BAY_Z = -21.8;
    flat(0.1, 5.4, dashMat, BAY_X - 1.4, BAY_Z);
    flat(0.1, 5.4, dashMat, BAY_X + 1.4, BAY_Z);
    flat(2.9, 0.1, dashMat, BAY_X, BAY_Z - 2.7);

    var wall = new THREE.Mesh(
      new THREE.BoxGeometry(18, 6.5, 6),
      new THREE.MeshStandardMaterial({ color: 0xd5dae5, roughness: 0.7 })
    );
    wall.position.set(0, 3.25, -30);
    var roofCap = new THREE.Mesh(new THREE.BoxGeometry(18.4, 0.3, 6.4), new THREE.MeshStandardMaterial({ color: 0x2a3a5e }));
    roofCap.position.set(0, 6.65, -30);
    scene.add(wall, roofCap);

    var windowMat = new THREE.MeshBasicMaterial({ color: 0x9db8ff });
    [1.7, 3.5].forEach(function (y) {
      for (var x = -8; x <= 8; x += 2) {
        if (Math.abs(x) < 2.5) continue;
        var win = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1), windowMat);
        win.position.set(x, y, -26.98);
        scene.add(win);
      }
    });
    var door = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 2.3), new THREE.MeshBasicMaterial({ color: 0x0a1428 }));
    door.position.set(0, 1.15, -26.97);
    var signTex = texture(512, 160, function (ctx, w, h) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#11224a";
      ctx.font = "800 96px Sora, Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("CBR", w / 2, 108);
      ctx.fillStyle = "#5b8cff";
      ctx.fillRect(w / 2 - 90, 126, 180, 8);
    });
    var sign = new THREE.Mesh(new THREE.PlaneGeometry(4, 1.25), new THREE.MeshBasicMaterial({ map: signTex }));
    sign.position.set(0, 4.7, -26.96);
    scene.add(door, sign);

    var instructor = new THREE.Group();
    var shirtTex = texture(128, 160, function (ctx, w, h) {
      ctx.fillStyle = "#1d4ed8";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#ffffff";
      ctx.font = "800 44px Sora, Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("CBR", w / 2, 70);
    });
    var shirtSide = new THREE.MeshStandardMaterial({ color: 0x1d4ed8 });
    var torso = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.8, 0.34), [
      shirtSide, shirtSide, shirtSide, shirtSide, new THREE.MeshBasicMaterial({ map: shirtTex }), shirtSide
    ]);
    torso.position.y = 1.2;
    var skin = new THREE.MeshStandardMaterial({ color: 0xe0b48f });
    var head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), skin);
    head.position.y = 1.85;
    var hair = new THREE.Mesh(
      new THREE.SphereGeometry(0.235, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0x2b2118 })
    );
    hair.position.y = 1.87;
    var trousers = new THREE.MeshStandardMaterial({ color: 0x1b2440 });
    var legL = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.8, 0.3), trousers);
    legL.position.set(-0.16, 0.4, 0);
    var legR = legL.clone();
    legR.position.x = 0.16;
    function makeArm(x) {
      var pivot = new THREE.Group();
      pivot.position.set(x, 1.55, 0);
      var arm = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.7, 0.2), shirtSide);
      arm.position.y = -0.35;
      var hand = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 10), skin);
      hand.position.y = -0.76;
      pivot.add(arm, hand);
      return pivot;
    }
    var armL = makeArm(-0.4), armR = makeArm(0.4);
    instructor.add(torso, head, hair, legL, legR, armL, armR);
    instructor.scale.setScalar(1.4);
    instructor.position.set(-3.2, 0, -25.4);
    scene.add(instructor);

    var car = new THREE.Group();
    var white = new THREE.MeshStandardMaterial({ color: 0xf2f4f8, roughness: 0.35, metalness: 0.2 });
    var grey = new THREE.MeshStandardMaterial({ color: 0x8c97ab, roughness: 0.5 });
    var glass = new THREE.MeshStandardMaterial({ color: 0x0a1428, roughness: 0.1, metalness: 0.8 });
    var tyre = new THREE.MeshStandardMaterial({ color: 0x050a14, roughness: 0.8 });

    var body = new THREE.Mesh(new THREE.BoxGeometry(2, 0.6, 4.4), white);
    body.position.y = 0.75;
    var bumper = new THREE.Mesh(new THREE.BoxGeometry(2.04, 0.22, 0.14), grey);
    bumper.position.set(0, 0.55, 2.22);
    var cabin = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.55, 2.2), glass);
    cabin.position.set(0, 1.3, 0.2);
    var roof = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.1, 2.0), white);
    roof.position.set(0, 1.62, 0.2);
    var roofSign = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.3, 0.12), new THREE.MeshBasicMaterial({ color: 0x5b8cff }));
    roofSign.position.set(0, 1.82, 0.2);
    var plateTex = texture(128, 32, function (ctx, w) {
      ctx.fillStyle = "#f5f5f0";
      ctx.fillRect(0, 0, w, 32);
      ctx.fillStyle = "#11224a";
      ctx.font = "700 24px Sora, Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("L-12-APX", w / 2, 25);
    });
    var plate = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.18), new THREE.MeshBasicMaterial({ map: plateTex }));
    plate.position.set(0, 0.55, 2.295);
    car.add(body, bumper, cabin, roof, roofSign, plate);

    var tailMat = new THREE.MeshBasicMaterial({ color: 0xb02a3a });
    [-0.72, 0.72].forEach(function (x) {
      var l = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.14, 0.06), tailMat);
      l.position.set(x, 0.95, 2.21);
      car.add(l);
    });

    var indOff = 0x5a3a0a;
    var indL = new THREE.MeshBasicMaterial({ color: indOff });
    var indR = new THREE.MeshBasicMaterial({ color: indOff });
    [[-0.8, indL], [0.8, indR]].forEach(function (s) {
      var l = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.1, 0.06), s[1]);
      l.position.set(s[0], 0.77, 2.21);
      car.add(l);
    });

    var wheels = [];
    [[-1.02, 1.4], [1.02, 1.4], [-1.02, -1.4], [1.02, -1.4]].forEach(function (p) {
      var w = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.34, 20), tyre);
      w.rotation.z = Math.PI / 2;
      w.position.set(p[0], 0.42, p[1]);
      car.add(w);
      wheels.push(w);
    });

    var glowMat = new THREE.MeshBasicMaterial({ color: 0x5b8cff, transparent: true, opacity: 0.18 });
    var glow = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 5.6), glowMat);
    glow.rotation.x = -Math.PI / 2;
    glow.position.y = 0.03;
    car.add(glow);

    var beamTex = texture(64, 256, function (ctx, w, h) {
      var g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "rgba(188,208,255,0)");
      g.addColorStop(1, "rgba(188,208,255,0.45)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(2, 0);
      ctx.lineTo(w - 2, 0);
      ctx.lineTo(w * 0.7, h);
      ctx.lineTo(w * 0.3, h);
      ctx.closePath();
      ctx.fill();
    });
    var beam = new THREE.Mesh(
      new THREE.PlaneGeometry(3.6, 10),
      new THREE.MeshBasicMaterial({ map: beamTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    beam.rotation.x = -Math.PI / 2;
    beam.position.set(0, 0.04, -7.2);
    car.add(beam);
    scene.add(car);

    function resize() {
      var w = hero.clientWidth, h = hero.clientHeight;
      var wide = w > 900;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.fov = w / h < 0.8 ? 62 : 45;
      camera.setViewOffset(w, h, wide ? -w * 0.18 : 0, wide ? 0 : -h * 0.2, w, h);
      camera.updateProjectionMatrix();
    }
    window.addEventListener("resize", resize);
    resize();

    var DRIVE = 7, HOLD = 5.5, FADE = 0.6, Z0 = 10;
    var T = reduceMotion ? DRIVE + 2 : 0;
    var fading = false, prevZ = Z0;
    var visible = true, last = performance.now();
    var badgeSpot = new THREE.Vector3(-3.2, 3.4, -25.4);
    new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }).observe(hero);

    function frame(now) {
      requestAnimationFrame(frame);
      if (!visible) return;
      var dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      if (!reduceMotion) {
        T += dt;
        if (T > DRIVE + HOLD && !fading) {
          fading = true;
          canvas.style.opacity = 0;
          badge.classList.remove("show");
        }
        if (T > DRIVE + HOLD + FADE) {
          T = 0;
          fading = false;
          prevZ = Z0;
          canvas.style.opacity = 1;
        }
      }

      var p = clamp01(T / DRIVE);
      var e = 1 - Math.pow(1 - p, 2.2);
      var cz = Z0 + (BAY_Z - Z0) * e;
      var lat = smooth((p - 0.45) / 0.55);
      var cx = BAY_X * lat;
      var speed = dt > 0 ? Math.abs(prevZ - cz) / dt : 0;
      prevZ = cz;

      car.position.set(cx, reduceMotion ? 0 : Math.sin(now / 300) * 0.012 * Math.min(speed / 6, 1), cz);
      car.rotation.y = -0.3 * Math.sin(Math.PI * lat);
      wheels.forEach(function (w) { w.rotation.x -= (speed * dt) / 0.42; });
      tailMat.color.setHex(p > 0.55 ? 0xff6677 : 0xb02a3a);
      glowMat.opacity = 0.16 + Math.sin(now / 500) * 0.04;
      beam.visible = p < 1;

      var signalOn = p > 0.35 && p < 1 && Math.floor(now / 260) % 2 === 0;
      indR.color.setHex(signalOn ? 0xffa31a : indOff);
      roofSign.material.color.setHex(p >= 1 ? 0x22c55e : 0x5b8cff);

      var cheer = smooth((T - DRIVE - 0.9) / 0.4);
      var wiggle = reduceMotion ? 0 : Math.sin(now / 130) * 0.12;
      armR.rotation.z = (2.75 + wiggle) * cheer;
      armL.rotation.z = (-2.75 - wiggle) * cheer;

      camera.position.set(cx * 0.35, 4.2, cz + 10.5);
      camera.lookAt(cx * 0.3, 1.5, cz - 14);

      var showBadge = T > DRIVE + 0.9 && !fading;
      badge.classList.toggle("show", showBadge);
      if (showBadge) {
        var v = badgeSpot.clone().project(camera);
        badge.style.left = (v.x * 0.5 + 0.5) * hero.clientWidth + "px";
        badge.style.top = (-v.y * 0.5 + 0.5) * hero.clientHeight + "px";
      }

      renderer.render(scene, camera);
    }
    requestAnimationFrame(frame);
  }

  if (!reduceMotion) {
    document.querySelectorAll(".tilt").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        card.style.setProperty("--ry", (x * 12).toFixed(2) + "deg");
        card.style.setProperty("--rx", (-y * 12).toFixed(2) + "deg");
      });
      card.addEventListener("pointerleave", function () {
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
      });
    });
  }

  var form = document.getElementById("form");
  var msg = document.getElementById("msg");
  document.querySelectorAll("select").forEach(function (sel) {
    var label = sel.closest("label").firstChild.textContent.trim();
    var wrap = document.createElement("div");
    wrap.className = "dd";
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "dd-btn";
    btn.setAttribute("aria-haspopup", "listbox");
    btn.setAttribute("aria-expanded", "false");
    var list = document.createElement("ul");
    list.className = "dd-list";
    list.setAttribute("role", "listbox");
    var items = [], active = 0;

    Array.from(sel.options).forEach(function (opt) {
      if (!opt.value) return;
      var li = document.createElement("li");
      li.setAttribute("role", "option");
      li.textContent = opt.textContent;
      li.addEventListener("click", function () { choose(items.length ? items.findIndex(function (it) { return it.li === li; }) : 0); });
      items.push({ opt: opt, li: li });
      list.appendChild(li);
    });

    function sync() {
      var o = sel.options[sel.selectedIndex];
      btn.textContent = o ? o.textContent : "";
      btn.classList.toggle("placeholder", !sel.value);
      btn.setAttribute("aria-label", label + ", " + btn.textContent);
      items.forEach(function (it) {
        var on = it.opt.index === sel.selectedIndex;
        it.li.setAttribute("aria-selected", on);
        it.li.classList.toggle("on", on);
      });
    }
    function mark(n) {
      active = Math.max(0, Math.min(items.length - 1, n));
      items.forEach(function (it, i) { it.li.classList.toggle("active", i === active); });
      items[active].li.scrollIntoView({ block: "nearest" });
    }
    function setOpen(on) {
      wrap.classList.toggle("open", on);
      btn.setAttribute("aria-expanded", on);
      if (on) {
        var cur = items.findIndex(function (it) { return it.opt.index === sel.selectedIndex; });
        mark(cur < 0 ? 0 : cur);
      }
    }
    function choose(n) {
      sel.selectedIndex = items[n].opt.index;
      sel.classList.remove("error");
      sync();
      setOpen(false);
      btn.focus();
    }

    btn.addEventListener("click", function () { setOpen(!wrap.classList.contains("open")); });
    btn.addEventListener("keydown", function (e) {
      var open = wrap.classList.contains("open");
      if (e.key === "Escape" && open) { setOpen(false); return; }
      if (e.key === "Tab") { setOpen(false); return; }
      if (["ArrowDown", "ArrowUp", "Home", "End", "Enter", " "].indexOf(e.key) < 0) return;
      e.preventDefault();
      if (!open) { setOpen(true); return; }
      if (e.key === "ArrowDown") mark(active + 1);
      else if (e.key === "ArrowUp") mark(active - 1);
      else if (e.key === "Home") mark(0);
      else if (e.key === "End") mark(items.length - 1);
      else choose(active);
    });
    document.addEventListener("click", function (e) { if (!wrap.contains(e.target)) setOpen(false); });
    form.addEventListener("reset", function () { setTimeout(sync, 0); });

    sel.classList.add("dd-native");
    sel.tabIndex = -1;
    sel.setAttribute("aria-hidden", "true");
    wrap.append(btn, list);
    sel.parentNode.insertBefore(wrap, sel.nextSibling);
    sync();
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = true;
    form.querySelectorAll("input, select").forEach(function (field) {
      if (!field.required) return;
      var bad = !field.value.trim() || (field.type === "email" && !/^\S+@\S+\.\S+$/.test(field.value));
      field.classList.toggle("error", bad);
      if (bad) ok = false;
    });
    if (!ok) {
      msg.textContent = "Controleer de rood omrande velden en probeer het opnieuw.";
      return;
    }
    
    msg.textContent = "Bedankt! We bellen je binnen één werkdag.";
    form.reset();
  });
})();