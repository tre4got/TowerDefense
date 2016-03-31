﻿MyGame.GameObjects = (function (graphics) {
    'use strict';
    
    var gameObjects = {},
        towerGridActive = false;
    
    function GameObjects(){
        var that = {},
            objectsList = {},
            nextId = 0;

        that.add = function (gameObject){
            var newId = ++nextId;
            gameObject.id = newId;
            objectsList[newId] = gameObject;
        }

        that.remove = function (objectId){
            delete objectsList[objectId];
        }
        
        that.getObject = function (objectId){
            if (objectsList.hasOwnProperty(objectId))
                return objectsList[objectId];
        }

        that.getObjectList = function (){
            var objects = [];
            for (var key in objectsList) {
                if (objectsList.hasOwnProperty(key)) {
                    objects.push(objectsList[key]);
                }
            }
            return objects;
        }

        return that;
    }
    
    function ToggleTowerGrid(){
        towerGridActive = !towerGridActive;
    }
    
    function findTarget(tower) {
        var thisTower = { x: tower.position.x, y: tower.position.y, radius: tower.radius },
            needNewTarget = true;

        /* Check if have a target already */
        if (tower.targetId != -1) {
            var target = gameObjects.getObject(tower.targetId),
                targetCircle = { x: target.position.x, y: target.position.y, radius: target.radius };
            /* Need to check if the current target is still in range */
            needNewTarget = !circleCollisionDetection(targetCircle, thisTower);
        }

        if (needNewTarget) {
            tower.targetId = -1;
            var objectList = gameObjects.getObjectList();
            for (var i = 0; i < objectList.length; ++i) {
                if (objectList[i].isCreep) {
                    var creep = { x: objectList[i].position.x, y: objectList[i].position.y, radius: objectList[i].size / 2 };
                    if (circleCollisionDetection(creep, thisTower)) {
                        tower.targetId = objectList[i].id;
                        break;
                    }
                }
            }
        }
    }
    
    function GameObject(spec){
        var that = {
            /* x,y coordinate of the GameObject */
            position : spec.position,
            /* list of gridIds that this GameObject is a member of */
            gridIds : spec.gridIds,
            rotation : 0,
            size : spec.size,
            id : 0
        };
        
        that.removeGridId = function (idToRemove){
            var index = gridIds.indexOf(idToRemove);
            if(index !== -1)
                gridIds.splice(index, 1);
        }
        
        that.getType = function (){
            return spec.type;
        }

        return that;
    };
    
    function Creep(spec){
        var that = GameObject(spec);

        that.imageId = 'C1';
        that.velocity = { x: 1, y: 1 };
        that.speed = 200;
        that.hp = 50;
        that.angle = 3 * Math.PI / 180;
        that.isCreep = true;
        
        that.update = function (elapsedTime){
            that.angle += .5 * Math.PI / 180;
            that.position.x += 100 * Math.cos(that.angle) * (elapsedTime / 1000);
            that.position.y += 100 * Math.sin(that.angle) * (elapsedTime / 1000);
        }

        gameObjects.add(that);
    }

    function Turret(spec){
        var that = GameObject(spec),
            defaultRotationSpeed = Math.PI * .3;
        
        that.imageId = 'T1';
        that.fireRate = 1;
        that.damage = 2;
        that.targetTypes = 2;
        that.radius = 100;
        that.targetId = -1;

        that.update = function (elapsedTime){
            findTarget(that);
            if (that.targetId == -1) {
                that.rotation += defaultRotationSpeed * (elapsedTime / 1000);
            } else {
               /* TODO: Track Target */
                that.rotation += defaultRotationSpeed * (elapsedTime / 1000);
            }
                
        }

        gameObjects.add(that);
    }
    
    function Missile(spec){
        var that = GameObject(spec),
            defaultRotationSpeed = Math.PI * .75;

        that.imageId = 'M1';
        that.fireRate = .5;
        that.damage = 5;
        that.targetTypes = 1;
        that.radius = 150;
        that.targetId = -1;

        that.update = function (elapsedTime) {
            findTarget(that);
            if (that.targetId == -1) {
                that.rotation += defaultRotationSpeed * (elapsedTime / 1000);
            } else {
                /* TODO: Track Target */
                that.rotation += defaultRotationSpeed * (elapsedTime / 1000);
            }
                
        }
        
        gameObjects.add(that);
    }
    
    function Bomb(spec){
        var that = GameObject(spec),
            defaultRotationSpeed = Math.PI * .2;
        
        that.imageId = 'B1';
        that.fireRate = .25;
        that.damage = 10;
        that.targetTypes = 0;
        that.radius = 250;
        that.targetId = -1;
        
        that.update = function (elapsedTime) {
            findTarget(that);
            if (that.targetId == -1) {
                that.rotation += defaultRotationSpeed * (elapsedTime / 1000);
            } else {
                /* TODO: Track Target */
                that.rotation += defaultRotationSpeed * (elapsedTime / 1000);
            }
        }
        
        gameObjects.add(that);
    }

    function Frost(spec) {
        var that = GameObject(spec),
            defaultRotationSpeed = Math.PI * .5;
        
        that.imageId = 'F1';
        that.fireRate = 2;
        that.damage = 3;
        that.targetTypes = 0;
        that.radius = 100;
        that.targetId = -1;
        
        that.update = function (elapsedTime) {
            findTarget(that);
            if (that.targetId == -1) {
                that.rotation += defaultRotationSpeed * (elapsedTime / 1000);
            } else {
                /* TODO: Track Target */
                that.rotation += defaultRotationSpeed * (elapsedTime / 1000);
            }
                
        }
        
        gameObjects.add(that);
    }
    
    function UpdateAll(elapsedTime){
        var objectList = gameObjects.getObjectList();
        for (var i = 0; i < objectList.length; ++i) {
            objectList[i].update(elapsedTime);
        }
    }
    
    function RenderAll(){
        graphics.clearCanvas();
        var objectList = gameObjects.getObjectList();
        for (var i = 0; i < objectList.length; ++i) {
            var obj = objectList[i];
            graphics.drawGameObject({
                position : obj.position,
                rotation : obj.rotation,
                size : obj.size,
                imageId : obj.imageId,
                radius : obj.radius,
                towerGridActive : towerGridActive
            });
        }
    }
    
    function circleCollisionDetection(circle1, circle2) {
        var dx = circle1.x - circle2.x;
        var dy = circle1.y - circle2.y;
        var distance = Math.sqrt(dx * dx + dy * dy);
        
        return distance < circle1.radius + circle2.radius;
    }

    gameObjects = GameObjects();

    return {
        Turret : Turret,
        Missile : Missile,
        Bomb : Bomb,
        Frost : Frost,
        Creep : Creep,
        UpdateAll : UpdateAll,
        RenderAll : RenderAll,
        ToggleTowerGrid : ToggleTowerGrid
    };

}(MyGame.graphics));