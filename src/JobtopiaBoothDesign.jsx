import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, User, Megaphone, Tent, Calendar, Clock, CreditCard, Building2, Wallet, Download } from 'lucide-react';
import * as THREE from 'three';

const JobtopiaBoothDesign = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [audioContext, setAudioContext] = useState(null);
  
  const [formData, setFormData] = useState({
    boothSize: 'Medium',
    date: '08/17/2025',
    time: '',
    interviewTime: '',
    relatedToListing: true,
    listingNumber: '',
    selectedTemplate: 0,
    boothColor: '#9333ea',
    accentColor: '#f59e0b',
    virtualChatEnabled: true,
    paymentMethod: 'credit-card'
  });

  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const boothRef = useRef(null);

  const templates = [
    { id: 0, name: 'Modern', icon: '🏢', color: '#9333ea', accent: '#f59e0b' },
    { id: 1, name: 'Tech', icon: '💻', color: '#3b82f6', accent: '#06b6d4' },
    { id: 2, name: 'Creative', icon: '🎨', color: '#ec4899', accent: '#f97316' },
    { id: 3, name: 'Corporate', icon: '💼', color: '#1e293b', accent: '#64748b' },
    { id: 4, name: 'Eco', icon: '🌿', color: '#22c55e', accent: '#84cc16' },
    { id: 5, name: 'Luxury', icon: '💎', color: '#7c3aed', accent: '#fbbf24' },
    { id: 6, name: 'Minimal', icon: '⚪', color: '#6b7280', accent: '#d1d5db' }
  ];

  useEffect(() => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    setAudioContext(ctx);
    return () => ctx?.close();
  }, []);

  const playClickSound = useCallback(() => {
    if (!audioContext) return;
    try {
      // Resume audio context if it's suspended (browser autoplay policy)
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Punchier click sound with better audibility
      oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.05);
      gainNode.gain.setValueAtTime(1.0, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.12);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.12);
    } catch (e) {
      // Silently fail if audio context issues
    }
  }, [audioContext]);

  const updateFormData = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Initialize 3D Scene
  useEffect(() => {
    if (!canvasRef.current || currentStep !== 3) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
    camera.position.set(0, 2, 6);
    camera.lookAt(0, 1, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvasRef.current,
      antialias: true 
    });
    renderer.setSize(400, 280);
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Ground
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xe5e7eb,
      roughness: 0.8 
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Create booth
    createBooth(scene, formData.boothColor, formData.accentColor);

    // Animation loop
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      if (boothRef.current) {
        boothRef.current.rotation.y += 0.009;
      }
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      renderer.dispose();
    };
  }, [currentStep]);

  // Update booth colors when template or colors change
  useEffect(() => {
    if (sceneRef.current && boothRef.current) {
      updateBoothColors(formData.boothColor, formData.accentColor);
    }
  }, [formData.boothColor, formData.accentColor, formData.selectedTemplate]);

  const createBooth = (scene, mainColor, accentColor) => {
    const boothGroup = new THREE.Group();
    
    // Back wall
    const backWallGeometry = new THREE.BoxGeometry(3, 2.5, 0.1);
    const backWallMaterial = new THREE.MeshStandardMaterial({ color: mainColor });
    const backWall = new THREE.Mesh(backWallGeometry, backWallMaterial);
    backWall.position.set(0, 1.25, -1.5);
    backWall.castShadow = true;
    boothGroup.add(backWall);

    // Side walls with windows
    const sideWallGeometry = new THREE.BoxGeometry(0.1, 2.5, 3);
    
    // Left wall - split into sections with a window
    const leftWallBottom = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.8, 3),
      backWallMaterial
    );
    leftWallBottom.position.set(-1.5, 0.4, 0);
    leftWallBottom.castShadow = true;
    boothGroup.add(leftWallBottom);

    const leftWallTop = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.8, 3),
      backWallMaterial
    );
    leftWallTop.position.set(-1.5, 2.1, 0);
    leftWallTop.castShadow = true;
    boothGroup.add(leftWallTop);

    // Left window frame
    const windowMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x88ccff, 
      transparent: true, 
      opacity: 0.3,
      side: THREE.DoubleSide
    });
    const leftWindow = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.9, 2.4),
      windowMaterial
    );
    leftWindow.position.set(-1.5, 1.25, 0);
    boothGroup.add(leftWindow);

    // Right wall - split into sections with a window
    const rightWallBottom = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.8, 3),
      backWallMaterial
    );
    rightWallBottom.position.set(1.5, 0.4, 0);
    rightWallBottom.castShadow = true;
    boothGroup.add(rightWallBottom);

    const rightWallTop = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.8, 3),
      backWallMaterial
    );
    rightWallTop.position.set(1.5, 2.1, 0);
    rightWallTop.castShadow = true;
    boothGroup.add(rightWallTop);

    // Right window
    const rightWindow = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.9, 2.4),
      windowMaterial
    );
    rightWindow.position.set(1.5, 1.25, 0);
    boothGroup.add(rightWindow);

    // Top banner
    const bannerGeometry = new THREE.BoxGeometry(3, 0.4, 0.1);
    const bannerMaterial = new THREE.MeshStandardMaterial({ color: accentColor });
    const banner = new THREE.Mesh(bannerGeometry, bannerMaterial);
    banner.position.set(0, 2.6, -1.5);
    banner.castShadow = true;
    boothGroup.add(banner);

    // Logo panel
    const logoGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.05);
    const logoMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const logo = new THREE.Mesh(logoGeometry, logoMaterial);
    logo.position.set(0, 2, -1.45);
    boothGroup.add(logo);

    // Info panels
    const panelGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.05);
    const panelMaterial = new THREE.MeshStandardMaterial({ color: accentColor });
    
    const leftPanel = new THREE.Mesh(panelGeometry, panelMaterial);
    leftPanel.position.set(-0.8, 1, -1.45);
    boothGroup.add(leftPanel);

    const rightPanel = new THREE.Mesh(panelGeometry, panelMaterial);
    rightPanel.position.set(0.8, 1, -1.45);
    boothGroup.add(rightPanel);

    // Counter/desk
    const counterGeometry = new THREE.BoxGeometry(2, 0.8, 0.6);
    const counterMaterial = new THREE.MeshStandardMaterial({ 
      color: accentColor,
      roughness: 0.3 
    });
    const counter = new THREE.Mesh(counterGeometry, counterMaterial);
    counter.position.set(0, 0.4, 1);
    counter.castShadow = true;
    boothGroup.add(counter);

    // Monitors on counter
    const monitorGeometry = new THREE.BoxGeometry(0.4, 0.3, 0.05);
    const monitorMaterial = new THREE.MeshStandardMaterial({ color: 0x1f2937 });
    
    const leftMonitor = new THREE.Mesh(monitorGeometry, monitorMaterial);
    leftMonitor.position.set(-0.5, 0.95, 1);
    leftMonitor.rotation.x = -0.2;
    boothGroup.add(leftMonitor);

    const rightMonitor = new THREE.Mesh(monitorGeometry, monitorMaterial);
    rightMonitor.position.set(0.5, 0.95, 1);
    rightMonitor.rotation.x = -0.2;
    boothGroup.add(rightMonitor);

    // Add two people sitting at the booth
    // Person 1 (left side)
    const person1Body = new THREE.CylinderGeometry(0.15, 0.2, 0.6, 8);
    const personMaterial = new THREE.MeshStandardMaterial({ color: 0x3b82f6 }); // Blue shirt
    const person1 = new THREE.Mesh(person1Body, personMaterial);
    person1.position.set(-0.6, 0.3, 1.5);
    boothGroup.add(person1);

    // Person 1 head
    const headGeometry = new THREE.SphereGeometry(0.15, 8, 8);
    const skinMaterial = new THREE.MeshStandardMaterial({ color: 0xffdbac });
    const person1Head = new THREE.Mesh(headGeometry, skinMaterial);
    person1Head.position.set(-0.6, 0.75, 1.5);
    boothGroup.add(person1Head);

    // Person 2 (right side)
    const person2Material = new THREE.MeshStandardMaterial({ color: 0xec4899 }); // Pink shirt
    const person2 = new THREE.Mesh(person1Body, person2Material);
    person2.position.set(0.6, 0.3, 1.5);
    boothGroup.add(person2);

    // Person 2 head
    const person2Head = new THREE.Mesh(headGeometry, skinMaterial);
    person2Head.position.set(0.6, 0.75, 1.5);
    boothGroup.add(person2Head);

    boothGroup.castShadow = true;
    scene.add(boothGroup);
    boothRef.current = boothGroup;
  };

  const updateBoothColors = (mainColor, accentColor) => {
    if (!boothRef.current) return;
    
    const children = boothRef.current.children;
    
    // Update walls (0, 1, 2)
    [0, 1, 2].forEach(i => {
      if (children[i]) {
        children[i].material.color.set(mainColor);
      }
    });
    
    // Update banner (3)
    if (children[3]) children[3].material.color.set(accentColor);
    
    // Update panels (5, 6)
    [5, 6].forEach(i => {
      if (children[i]) {
        children[i].material.color.set(accentColor);
      }
    });
    
    // Update counter (7)
    if (children[7]) children[7].material.color.set(accentColor);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-200 via-pink-100 to-orange-100 flex items-center justify-center p-4">
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .hover-shadow:hover {
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
        }
      `}</style>

      <div className="w-full max-w-md bg-gradient-to-br from-pink-200 to-pink-100 rounded-[3rem] shadow-2xl overflow-hidden border-8 border-gray-800 flex flex-col" style={{ height: '844px' }}>
        {/* iPhone Status Bar */}
        <div className="h-12 bg-gradient-to-br from-pink-200 to-pink-100 flex items-center justify-between px-6 pt-2 flex-shrink-0">
          <span className="text-sm font-semibold">9:41</span>
          <div className="w-24 h-7 bg-black rounded-full"></div>
          <div className="flex gap-2 items-center">
            <svg className="w-4 h-4" fill="black" viewBox="0 0 24 24">
              <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/>
            </svg>
            <svg className="w-5 h-5" fill="black" viewBox="0 0 24 24">
              <rect x="2" y="7" width="18" height="12" rx="2" ry="2" stroke="black" strokeWidth="1.5" fill="none"/>
              <rect x="4" y="9" width="14" height="8" fill="black"/>
              <rect x="20" y="10" width="2" height="6" rx="1" fill="black"/>
            </svg>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-6 py-4 overflow-y-auto overflow-x-hidden flex-1">
          {currentStep === 1 && (
            <div>
              <div className="flex items-center gap-4 mb-8">
                <button 
                  onClick={playClickSound}
                  className="p-2 hover:bg-white/50 rounded-lg transition-all hover-shadow"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-2xl font-bold">Employer Dashboard</h1>
              </div>

              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-full border-2 border-black flex items-center justify-center">
                  <User className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Welcome,</h2>
                  <h2 className="text-2xl font-bold">Representative Name</h2>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div 
                  className="bg-gradient-to-br from-blue-200 to-blue-100 rounded-2xl p-6 shadow-lg hover-shadow transition-all cursor-pointer"
                  onClick={playClickSound}
                >
                  <div className="w-12 h-12 bg-blue-300 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <Megaphone className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-center mb-4">Create Job Listing</h3>
                  <button className="w-full bg-blue-200 hover:bg-blue-300 text-black font-semibold py-3 rounded-full transition-all hover-shadow">
                    Post New Job
                  </button>
                </div>

                <div 
                  className="bg-gradient-to-br from-green-200 to-green-100 rounded-2xl p-6 shadow-lg hover-shadow transition-all cursor-pointer"
                >
                  <div className="w-12 h-12 bg-green-300 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <Tent className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-center mb-2">Booth Management</h3>
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setCurrentStep(2); playClickSound(); }}
                      className="flex-1 bg-green-200 hover:bg-green-300 text-black font-semibold py-2 px-3 rounded-full text-sm transition-all hover-shadow"
                    >
                      Create Booth
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); playClickSound(); }}
                      className="flex-1 bg-green-200 hover:bg-green-300 text-black font-semibold py-2 px-3 rounded-full text-sm transition-all hover-shadow"
                    >
                      Manage Booth
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div 
                  className="bg-gradient-to-br from-pink-200 to-pink-100 rounded-2xl p-6 shadow-lg hover-shadow transition-all cursor-pointer"
                  onClick={playClickSound}
                >
                  <h3 className="text-lg font-bold text-center mb-4">Manage Listings &<br/>Applications</h3>
                  <button className="w-full bg-pink-200 hover:bg-pink-300 text-black font-semibold py-3 rounded-full transition-all hover-shadow">
                    View All Jobs
                  </button>
                </div>

                <div 
                  className="bg-gradient-to-br from-purple-200 to-purple-100 rounded-2xl p-6 shadow-lg hover-shadow transition-all cursor-pointer"
                  onClick={playClickSound}
                >
                  <div className="w-12 h-12 bg-purple-300 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <User className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-center mb-4">Update Profile</h3>
                  <button className="w-full bg-purple-200 hover:bg-purple-300 text-black font-semibold py-3 rounded-full transition-all hover-shadow">
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <div className="flex items-center gap-4 mb-6">
                <button 
                  onClick={() => { setCurrentStep(1); playClickSound(); }}
                  className="p-2 hover:bg-white/50 rounded-lg transition-all hover-shadow"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-2xl font-bold">Create Job Fair Booth</h1>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xl font-bold mb-4">Booth Size:</label>
                  <div className="flex justify-center gap-6">
                    {['Small', 'Medium', 'Large'].map((size) => (
                      <button
                        key={size}
                        onClick={() => { updateFormData('boothSize', size); playClickSound(); }}
                        className={`w-28 h-28 rounded-full border-4 transition-all hover-shadow ${
                          formData.boothSize === size
                            ? 'bg-gradient-to-br from-blue-300 to-purple-300 border-purple-400 scale-110'
                            : 'bg-gradient-to-br from-blue-200 to-purple-200 border-purple-300'
                        }`}
                      >
                        <span className="font-semibold text-lg">{size}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xl font-bold mb-4">Booth Schedule:</label>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-purple-600 font-semibold mb-2">Date</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.date}
                          onChange={(e) => updateFormData('date', e.target.value)}
                          onFocus={playClickSound}
                          className="w-full px-4 py-3 border-2 border-purple-400 rounded-lg text-lg font-semibold focus:outline-none focus:border-purple-600"
                          placeholder="MM/DD/YYYY"
                        />
                        <Calendar className="absolute right-4 top-3.5 w-6 h-6 text-gray-600" />
                      </div>
                      <p className="text-sm text-gray-500 mt-1">MM/DD/YYYY</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Time</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.time}
                          onChange={(e) => updateFormData('time', e.target.value)}
                          onFocus={playClickSound}
                          className="w-full px-4 py-3 border-2 border-black rounded-lg text-lg font-semibold focus:outline-none focus:border-purple-600"
                        />
                        <Clock className="absolute right-4 top-3.5 w-6 h-6 text-gray-600" />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xl font-bold mb-2">Interview Time</label>
                  <p className="text-sm text-gray-600 mb-2">(Minute Per Participant)</p>
                  <input
                    type="text"
                    value={formData.interviewTime}
                    onChange={(e) => updateFormData('interviewTime', e.target.value)}
                    onFocus={playClickSound}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-xl font-bold">Related to Job Listing?</label>
                  <button
                    onClick={() => { updateFormData('relatedToListing', !formData.relatedToListing); playClickSound(); }}
                    className={`relative w-16 h-8 rounded-full transition-all hover-shadow ${
                      formData.relatedToListing ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
                      formData.relatedToListing ? 'translate-x-9' : 'translate-x-1'
                    }`} />
                    <span className={`absolute text-white font-bold text-sm ${
                      formData.relatedToListing ? 'left-2' : 'right-2'
                    }`}>
                      {formData.relatedToListing ? 'Yes' : 'No'}
                    </span>
                  </button>
                </div>

                <div>
                  <label className="block text-xl font-bold mb-2">Listing Number:</label>
                  <input
                    type="text"
                    value={formData.listingNumber}
                    onChange={(e) => updateFormData('listingNumber', e.target.value)}
                    onFocus={playClickSound}
                    placeholder="(Enter the Listing Number/ID, if related to any Job Listing)"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
                  />
                </div>

                <button
                  onClick={() => { setCurrentStep(3); playClickSound(); }}
                  className="w-full bg-gradient-to-r from-orange-300 to-orange-200 hover:from-orange-400 hover:to-orange-300 text-black font-bold py-4 rounded-full text-xl shadow-lg transition-all hover-shadow"
                >
                  Configure Booth
                </button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <button 
                  onClick={() => { setCurrentStep(2); playClickSound(); }}
                  className="p-2 hover:bg-white/50 rounded-lg transition-all hover-shadow"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-2xl font-bold">Booth Design</h1>
              </div>

              <div className="bg-white/80 rounded-2xl p-4 mb-4">
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden" style={{ height: '280px' }}>
                  <canvas ref={canvasRef} className="w-full h-full" />
                </div>
                <div className="flex justify-center gap-2 mt-4">
                  <div className="w-2 h-2 bg-black rounded-full"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                </div>
              </div>

              <div className="bg-white rounded-full p-2 flex mb-4 shadow-lg">
                <button 
                  onClick={playClickSound}
                  className="flex-1 bg-pink-200 text-black font-bold py-3 rounded-full transition-all hover:bg-pink-300 hover-shadow"
                >
                  Templates
                </button>
                <button 
                  onClick={playClickSound}
                  className="flex-1 text-black font-bold py-3 rounded-full transition-all hover:bg-gray-100 hover-shadow"
                >
                  Colors
                </button>
                <button 
                  onClick={playClickSound}
                  className="flex-1 text-black font-bold py-3 rounded-full transition-all hover:bg-gray-100 hover-shadow"
                >
                  Banners
                </button>
              </div>

              <div className="grid grid-cols-4 gap-3 mb-4">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => { 
                      updateFormData('selectedTemplate', template.id);
                      updateFormData('boothColor', template.color);
                      updateFormData('accentColor', template.accent);
                      playClickSound(); 
                    }}
                    className={`aspect-square rounded-2xl border-3 flex flex-col items-center justify-center transition-all hover-shadow ${
                      formData.selectedTemplate === template.id
                        ? 'bg-purple-200 border-purple-500 scale-105'
                        : 'bg-white border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{template.icon}</div>
                    <div className="text-xs font-semibold">{template.name}</div>
                  </button>
                ))}
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-lg mb-4">
                <h3 className="font-bold mb-3">Custom Colors</h3>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-xs text-gray-600 block mb-1">Main Color</label>
                    <input
                      type="color"
                      value={formData.boothColor}
                      onChange={(e) => updateFormData('boothColor', e.target.value)}
                      onClick={playClickSound}
                      className="w-full h-10 rounded-lg cursor-pointer border-2 border-gray-300"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-600 block mb-1">Accent Color</label>
                    <input
                      type="color"
                      value={formData.accentColor}
                      onChange={(e) => updateFormData('accentColor', e.target.value)}
                      onClick={playClickSound}
                      className="w-full h-10 rounded-lg cursor-pointer border-2 border-gray-300"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-4">
                <div className="bg-white rounded-2xl p-4 shadow-lg flex items-center justify-between">
                  <span className="text-lg font-bold">Virtual Chat Enabled</span>
                  <button
                    onClick={() => { updateFormData('virtualChatEnabled', !formData.virtualChatEnabled); playClickSound(); }}
                    className={`relative w-16 h-8 rounded-full transition-all hover-shadow ${
                      formData.virtualChatEnabled ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
                      formData.virtualChatEnabled ? 'translate-x-9' : 'translate-x-1'
                    }`} />
                    <span className={`absolute text-white font-bold text-sm ${
                      formData.virtualChatEnabled ? 'left-2' : 'right-2'
                    }`}>
                      {formData.virtualChatEnabled ? 'Yes' : 'No'}
                    </span>
                  </button>
                </div>

                <button
                  onClick={playClickSound}
                  className="w-full bg-white rounded-2xl p-4 shadow-lg flex items-center justify-between hover:bg-gray-50 transition-all hover-shadow"
                >
                  <span className="text-lg font-bold">Download Brochure</span>
                  <Download className="w-6 h-6" />
                </button>
              </div>

              <button
                onClick={() => { setCurrentStep(4); playClickSound(); }}
                className="w-full bg-gradient-to-r from-orange-300 to-orange-200 hover:from-orange-400 hover:to-orange-300 text-black font-bold py-4 rounded-full text-xl shadow-lg transition-all hover-shadow mb-4"
              >
                Save and Proceed to Payment
              </button>
            </div>
          )}

          {currentStep === 4 && (
            <div>
              <div className="flex items-center gap-4 mb-4">
                <button 
                  onClick={() => { setCurrentStep(3); playClickSound(); }}
                  className="p-2 hover:bg-white/50 rounded-lg transition-all hover-shadow"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold">Select Payment Type</h1>
                  <p className="text-lg">Total Due : Rm 100</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                {[
                  { id: 'credit-card', name: 'Credit / Debit Card', icon: CreditCard },
                  { id: 'bank-transfer', name: 'Bank Transfer', icon: Building2 },
                  { id: 'touch-n-go', name: "Touch 'n Go eWallet", icon: Wallet },
                  { id: 'paypal', name: 'Paypal', icon: CreditCard }
                ].map((method) => (
                  <button
                    key={method.id}
                    onClick={() => { updateFormData('paymentMethod', method.id); playClickSound(); }}
                    className="w-full bg-white rounded-2xl p-5 shadow-lg flex items-center gap-4 transition-all hover-shadow"
                  >
                    <method.icon className="w-8 h-8" />
                    <span className="flex-1 text-left text-lg font-bold">{method.name}</span>
                    <div className={`w-6 h-6 rounded-full border-2 border-black ${
                      formData.paymentMethod === method.id ? 'bg-black' : ''
                    }`}>
                      {formData.paymentMethod === method.id && (
                        <div className="w-3 h-3 bg-white rounded-full m-0.5"></div>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => { setCurrentStep(5); playClickSound(); }}
                className="w-full bg-gradient-to-r from-orange-300 to-orange-200 hover:from-orange-400 hover:to-orange-300 text-black font-bold py-4 rounded-full text-xl shadow-lg transition-all hover-shadow"
              >
                Pay
              </button>
            </div>
          )}

          {currentStep === 5 && (
            <div>
              <div className="flex items-center gap-4 mb-6">
                <button 
                  onClick={() => { setCurrentStep(4); playClickSound(); }}
                  className="p-2 hover:bg-white/50 rounded-lg transition-all hover-shadow"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-2xl font-bold">Review and Confirm<br/>Payment</h1>
              </div>

              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
                  <div className="bg-white rounded-2xl p-6 shadow-lg space-y-2">
                    <p className="text-base">Item: Job Fair Booth Package - {formData.boothSize}</p>
                    <p className="text-base">Price: Rm 100</p>
                    <p className="text-base">Includes: Premium Design, Virtual Chat, 3 Hours Live</p>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4">Payment Details</h2>
                  <div className="bg-white rounded-2xl p-6 shadow-lg space-y-4">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-8 h-8" />
                      <div>
                        <p className="font-semibold">Credit Card (Visa)</p>
                        <p className="text-sm">**** **** *** 1289</p>
                      </div>
                    </div>
                    <p className="text-base">Billing Email : email@gmail.com</p>
                    <p className="text-xl font-bold">Total Due: Rm 100</p>
                  </div>
                </div>

                <button
                  onClick={() => { setCurrentStep(6); playClickSound(); }}
                  className="w-full bg-gradient-to-r from-orange-300 to-orange-200 hover:from-orange-400 hover:to-orange-300 text-black font-bold py-4 rounded-full text-xl shadow-lg transition-all hover-shadow"
                >
                  Confirm & Pay Now
                </button>

                <button
                  onClick={playClickSound}
                  className="w-full text-black font-bold py-3 text-lg hover:underline"
                >
                  Cancel Transaction
                </button>
              </div>
            </div>
          )}

          {currentStep === 6 && (
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
              <p className="text-base mb-8">Your transaction has been completed.</p>

              <div className="w-48 h-48 mx-auto mb-8 bg-gradient-to-br from-teal-400 to-green-400 rounded-full flex items-center justify-center shadow-xl">
                <svg className="w-24 h-24 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <div className="text-left mb-8">
                <h2 className="text-2xl font-bold mb-4">Order Summary:</h2>
                <div className="space-y-2 text-base">
                  <p>Item: Job Fair Booth Package - {formData.boothSize}</p>
                  <p>Amount Paid: Rm 100</p>
                  <p>Payment Method: Credit Card ending in *** 1289</p>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={playClickSound}
                  className="w-full bg-gradient-to-r from-orange-300 to-pink-200 hover:from-orange-400 hover:to-pink-300 text-black font-bold py-4 rounded-full text-xl shadow-lg transition-all hover-shadow"
                >
                  View My Booth
                </button>
                <button
                  onClick={() => { setCurrentStep(1); playClickSound(); }}
                  className="w-full bg-gradient-to-r from-orange-300 to-pink-200 hover:from-orange-400 hover:to-pink-300 text-black font-bold py-4 rounded-full text-xl shadow-lg transition-all hover-shadow"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>

        {/* iPhone Home Indicator */}
        <div className="h-8 flex items-center justify-center bg-gradient-to-br from-pink-200 to-pink-100 flex-shrink-0">
          <div className="w-32 h-1 bg-black rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default JobtopiaBoothDesign;