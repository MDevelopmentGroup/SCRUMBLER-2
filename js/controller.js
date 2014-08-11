/**
 * Created by Victor77 on 23.06.2014.
 */

function ViewTasksCtrl($rootScope,$scope,$routeParams,$modal,TaskFactory,CommentFactory,CommentService,TipService){
    $rootScope.Menu={ProjectActive:1};
    $scope.IsDeleted=0;
    $routeParams.ID?$scope.MasterTask=$routeParams.ID:$scope.MasterTask=false;
    $scope.GetTasks=function(){

        $routeParams.ID?TaskFactory.Get($routeParams.ID,$scope.IsDeleted).success(function(data){
            $scope.tasks=data.children.filter(function(element,index, viewcatalog){
                // Parsing element
                element.Tags=JSON.parse(element.Tags)
                return true;
            });
        }):
            TaskFactory.Get0($scope.IsDeleted).success(function(data){$scope.tasks=data.children.filter(function(element,index, viewcatalog){
                element.Tags=JSON.parse(element.Tags);
                return true;
            });});
    };
    $scope.comments=[];
    $scope.GetCommentByTask=function(ID,ViewTask){
        if(ViewTask) {CommentFactory.GetCommentByTask(ID).success(function (data) {
                $scope.comments[ID] = data.children;
            });
        }
    };
    $scope.DeleteTask=function(data){
        $scope.Body=data.Name;
        $scope.ok=function(){
            TaskFactory.Delete(data.ID).success(function(){
                $scope.GetTasks();
            });
        };
        var modal=$modal({scope: $scope, backdrop:false, template: 'partials/modal/DeleteModal.html', show: true});
    };
    $scope.GetBreadcrumb=function(){
        $routeParams.ID?$scope.Breadcrumb=1:$scope.Breadcrumb=0;
        $routeParams.ID?TaskFactory.GetBreadcrumb($routeParams.ID).success(function(data){
            $scope.breadcrumbs=data.children;
        }):'';
    };
    $scope.GetBreadcrumb();
    $scope.GetTasks();
    $scope.CreateCommentForTask=function(item){
        CommentService.CreateCommentForTask(item,function(data){
            $scope.GetCommentByTask(item.ID,1);
        });
    };
    $scope.UpdateComment=function(task,ID){
        CommentService.UpdateComment(ID,function(data){
            $scope.GetCommentByTask(task.ID,1);
        });
    };
    $scope.Round=function(input){
        return Math.round(input);
    };
    $scope.RecoveryTask=function(item){
        TaskFactory.Recovery(item.ID).success(function(){
            $scope.GetTasks();
        });
    };
}
function CreateTaskCtrl($rootScope,$scope,$routeParams,TaskFactory,GroupFactory,TagsFactory, TreeFactory,TechnoDocService){
    $rootScope.Menu={ProjectActive:1};
    $scope.Submit=function(data){
        var MasterTask="";
        $routeParams.ID ? MasterTask=$routeParams.ID : MasterTask="";
        data.MasterTask=MasterTask;
        data.Annotation=$scope.Annotation;
        data.Targets=$scope.Targets;
        data.Sources=$scope.Sources;
        data.SourceTexts=$scope.SourceTexts;
        TaskFactory.Create(data).success(function(){
            MasterTask ? location.href="#/Tasks/"+MasterTask :location.href="#/Tasks"
        });
    };
    $scope.GetTree=function(){

    };
    $scope.GetGroups=function(){
        GroupFactory.GetGroupsByCompany().success(function(data){
            $scope.groups=data.children;
            $routeParams.ID?GroupFactory.GetGroupByTask($routeParams.ID).success(function(data){
                $scope.task.ScrumblerGroup=data.children[0].ID;
            }):'';
        });
    };
    $scope.GetGroups();
    $scope.task={TaskWeight:1};
    $scope.MasterProject=1;
    $scope.ViewComentBody=1;
    $scope.AddTag=function(item){
        if(!item.ID){TagsFactory.Create(item).success(function(data){return  item.ID=data.ID;})}
    };
    $scope.LoadTags = function(query) {
        return TagsFactory.GetTags(query);
    };



    $scope.SubTreeShow=false;
    $scope.ShowItems=function(item){   };
    $scope.SetShowItems=function(ind,items){
        var st=false;
        items.filter(function(element,index, viewcatalog){
            if(ind==index&&element.MasterTask==''){st=true}
            if(index>ind&&element.MasterTask==''){st=false}
            if(index>ind&&st){
                element.filter=!element.filter;
            }
            return true;
        });
    };
    $scope.set=function(item){
        $scope.ID=item.ID;
        $scope.Name=item.Name;
        $scope.ColLgSize=6;
        $scope.SubTreeShow=true;
    };
    $scope.cancel=function(){
        $scope.ID="";
        $scope.SubTreeShow=false;
        $scope.ColLgSize=12;
        $scope.Name="";
    };
    $scope.GetTrees=function(){
        TreeFactory.GetTrees().success(function(data){
            $scope.trees=$scope.sort(data.children);
        });
    };
    $scope.GetTrees();
    $scope.sort=function(data){
        var result=[];
        var DeleteItems=[];
        var temp=[];
        var SSN='';
        function insertArrayAt(array, index, arrayToInsert) {
            Array.prototype.splice.apply(array, [index, 0].concat(arrayToInsert));
            return array;
        }
        result=data.filter(function(element,index, viewcatalog){
            if(element.SSN.toString()==SSN.toString()){DeleteItems.push(index)}
            element.filter=true;
            return element.SSN.toString()==SSN.toString();
        });
        for(var l=DeleteItems.length-1;l>=0;l=l-1){data.splice(DeleteItems[l],1);}
        DeleteItems=[];
        while (data.length!=0){
            for(var i=0;i<=result.length-1;i++){
                if(result[i].SSN!=""){ SSN=result[i].SSN+"|"+result[i].ID}
                else{ SSN=result[i].ID}
                temp=data.filter(function(element,index, viewcatalog){
                    if(element.SSN.toString()==SSN.toString()){DeleteItems.push(index)}
                    element.filter=result[i].filter;
                    return element.SSN.toString()==SSN.toString();
                });
                if(temp.length>0){
                    insertArrayAt(result,i+1,temp);
                    for(var d=DeleteItems.length-1;d>=0;d--){data.splice(DeleteItems[d],1);}
                }
                DeleteItems=[];
            }
        }
        return result;
    };



    $scope.Annotation="";
    $scope.Targets=[];
    $scope.Sources=[];
    $scope.SourceTexts=[];
    $scope.CreateTechnoDoc=function(Annotation,Targets,Sources,SourceTexts){
        TechnoDocService.Create(Annotation,Targets,Sources,SourceTexts,function(Annotation,Targets,Sources,SourceTexts){
            $scope.Annotation=Annotation;
            $scope.Targets=Targets;
            $scope.Sources=Sources;
            $scope.SourceTexts=SourceTexts;
        })
    };
    $scope.createTask=true;

}
function UpdateTaskCtrl($rootScope,$scope,$routeParams,TaskFactory,GroupFactory,TagsFactory, TreeFactory){
    $rootScope.Menu={ProjectActive:1};
    $scope.GetGroups=function(){
        GroupFactory.GetGroupsByCompany().success(function(data){
            $scope.groups=data.children;
            $scope.GetTask();
        });
    };
    $scope.GetGroups();
    $scope.Submit=function(data){
        var MasterTask="";
        $routeParams.ID ? MasterTask=$routeParams.ID : MasterTask="";
        data.MasterTask=MasterTask;
        TaskFactory.Update(data).success(function(){
            MasterTask ? location.href="#/Tasks/"+MasterTask :location.href="#/Tasks"
        });
    };
    $scope.GetTask=function(){
        TaskFactory.GetTask($routeParams.ID).success(function(data){
            $scope.task=data.children.filter(function(element,index, viewcatalog){
                element.Tags=JSON.parse(element.Tags);
                return true;
            })[0];
        });
    };
    $scope.DeleteTag=function(data){
        TagsFactory.DeleteTagFromTask(data);
    };
    $scope.AddTag=function(item){
        if(!item.ID){TagsFactory.Create(item).success(function(data){return  item.ID=data.ID;})}
    };
    $scope.LoadTags = function(query) {
        return TagsFactory.GetTags(query);
    };


    $scope.SubTreeShow=false;
    $scope.ShowItems=function(item){   };
    $scope.SetShowItems=function(ind,items){
        var st=false;
        items.filter(function(element,index, viewcatalog){
            if(ind==index&&element.MasterTask==''){st=true}
            if(index>ind&&element.MasterTask==''){st=false}
            if(index>ind&&st){
                element.filter=!element.filter;
            }
            return true;
        });
    };
    $scope.set=function(item){
        $scope.ID=item.ID;
        $scope.Name=item.Name;
        $scope.ColLgSize=6;
        $scope.SubTreeShow=true;
    };
    $scope.cancel=function(){
        $scope.ID="";
        $scope.SubTreeShow=false;
        $scope.ColLgSize=12;
        $scope.Name="";
    };
    $scope.GetTrees=function(){
            TreeFactory.GetTrees().success(function(data){
                $scope.trees=$scope.sort(data.children);
            });
    };
    $scope.GetTrees();
    $scope.sort=function(data){
        var result=[];
        var DeleteItems=[];
        var temp=[];
        var SSN='';
        function insertArrayAt(array, index, arrayToInsert) {
            Array.prototype.splice.apply(array, [index, 0].concat(arrayToInsert));
            return array;
        }
        result=data.filter(function(element,index, viewcatalog){
            if(element.SSN.toString()==SSN.toString()){DeleteItems.push(index)}
            element.filter=true;
            return element.SSN.toString()==SSN.toString();
        });
        for(var l=DeleteItems.length-1;l>=0;l=l-1){data.splice(DeleteItems[l],1);}
        DeleteItems=[];
        while (data.length!=0){
            for(var i=0;i<=result.length-1;i++){
                if(result[i].SSN!=""){ SSN=result[i].SSN+"|"+result[i].ID}
                else{ SSN=result[i].ID}
                temp=data.filter(function(element,index, viewcatalog){
                    if(element.SSN.toString()==SSN.toString()){DeleteItems.push(index)}
                    element.filter=result[i].filter;
                    return element.SSN.toString()==SSN.toString();
                });
                if(temp.length>0){
                    insertArrayAt(result,i+1,temp);
                    for(var d=DeleteItems.length-1;d>=0;d--){data.splice(DeleteItems[d],1);}
                }
                DeleteItems=[];
            }
        }
        return result;
    }
    $scope.createTask=false;
}
function ViewTaskCtrl($rootScope,$scope,$routeParams,TaskFactory,CommentService){
    $rootScope.Menu={ProjectActive:1};
    $scope.GetTask=function(){
        TaskFactory.ViewTask($routeParams.ID).success(function(data){
            $scope.task=data.children.filter(function(element,index, viewcatalog){
                element.Tags=JSON.parse(element.Tags);
                element.Comments=JSON.parse(element.Comments);
                element.TechnoDocs=JSON.parse(element.TechnoDocs);
                return true;
            })[0];
            console.log($scope.task)
        });

    };

    $scope.aceLoaded=function(ace){
        var code = ace.getSession().getValue();
        ace.getSession().setValue(window.atob(code));
    };
    $scope.CreateCommentForTask=function(item){
        CommentService.CreateCommentForTask(item,function(data){
            $scope.GetTask();
        });
    };
    $scope.UpdateComment=function(task,ID){
        CommentService.UpdateComment(ID,function(data){
            $scope.GetTask();
        });
    };
    $scope.GetTask();
}


function ViewSprintsCtrl($rootScope,$scope,$routeParams,$alert,SprintFactory,SystemUserFactory,CommentFactory){
    $rootScope.Menu={ViewSprints:1};

    $scope.GetSprints=function(){
        $routeParams.ID?SprintFactory.GetSprintsByTask($routeParams.ID).success(function(data){
            $scope.sprints=data.children;
        }):
        SprintFactory.GetSprints().success(function(data){
            $scope.sprints=data.children;
        });
    };
    $scope.GetUsersInGroupByTask=function(ID){
        SystemUserFactory.GetUsersInGroupByTask(ID)
            .success(function(data){$scope.users=data.children;}).error(function(data){
                var myAlert = $alert({title: $rootScope.Page.ErrorStatus["0"],
                    content: $rootScope.Page.ErrorStatus[data.Status.Data],
                    placement: 'top-right',
                    type: 'danger',
                    show: true,
                    duration:3});
            });
    };
    $scope.SetShooterForTask=function(data,SystemUserID){
        data.ShooterID=SystemUserID;
        SprintFactory.SetShooterForTask(data)
            .success(function(data){
                var myAlert = $alert({title: $rootScope.Page.SuccessStatus["0"],
                    content: $rootScope.Page.SuccessStatus["1"],
                    placement: 'top-right',
                    type: 'success',
                    show: true,
                    duration:3});
                $scope.GetSprints();
            })
            .error(function(data){
            var myAlert = $alert({title: $rootScope.Page.ErrorStatus["0"],
                content: $rootScope.Page.ErrorStatus["1"],
                placement: 'top-right',
                type: 'danger',
                show: true,
                duration:3});
        });
    };
    $scope.comments=[];
    $scope.GetCommentByTask=function(ID,ViewSprint){
        if(ViewSprint){
            CommentFactory.GetCommentByTask(ID).success(function(data){
                $scope.comments[ID]=data.children;
            });
        }
    };
    $scope.Comment=function(item){

    };
    $scope.GetSprints();
}
function ViewTasksInTheWorkCtrl($rootScope,$scope,$routeParams,$alert,SprintFactory,SystemUserFactory,CommentFactory){
    $rootScope.Menu={inWorkActive:1};$scope.comments=[];
    $scope.TasksInTheWork=function(){
        SprintFactory.TasksInTheWork().success(function(data){
            $scope.sprints=data.children;
        });
    };
    $scope.GetCommentByTask=function(ID,ViewTask){
        if(ViewTask) {CommentFactory.GetCommentByTask(ID).success(function (data) {
            $scope.comments[ID] = data.children;
        });
        }
    };
    $scope.TasksInTheWork();
}


function CreateSystemUserCtrl($rootScope,$scope,$routeParams,SystemUserFactory){
    $rootScope.Menu={ViewUsers:1};
    $scope.Submit=function(data){
        $routeParams.uid? data.uid=$routeParams.uid:'';
        SystemUserFactory.Create(data).success(function(data){});
    };
    $scope.LoginIsValid=function(data){
        SystemUserFactory.LoginIsValid(data).success(function(data){
            $scope.LoginStatus=data.Status.Login;
        })
    };
}
function UpdateSystemUserCtrl($rootScope,$scope,$routeParams,SystemUserFactory){
    $rootScope.Menu={ViewUsers:1};
    $scope.Submit=function(data){
        SystemUserFactory.Update(data).success(function(data){});
    };
    $scope.LoginIsValid=function(data){
        SystemUserFactory.LoginIsValid(data).success(function(data){
            $scope.LoginStatus=data.Status.Login;
        })
    };
    $scope.GetUser=function(){
        SystemUserFactory.GetUserByID($routeParams.ID).success(function(data){
            $scope.user=data.children[0];
        });
    };
    $scope.GetUser();

    $scope.ChangeGitHubLogin=function(data){
        SystemUserFactory.UpdateGitHubLogin(data).success(function(data){});
    };
}
function RegistrationCtrl($rootScope,$scope,$routeParams,SystemUserFactory,md5){
    $rootScope.Menu={ViewUsers:1};
    $scope.Submit=function(data){
        data.uid=$routeParams.uid;
        SystemUserFactory.Registration(data).success(function(data){
            location.reload();
        });
    };
    $scope.PhoneNumberFilter=function(text){
        text = text.replace(/[^0-9]/g, '');
        if(text.length>11){text=text.substring(0,11)}
        switch (text.length){
            case 1: text = text.replace(/^8/, "7");    break;
            case 5: text = text.replace(/(\d{1})(\d{3})(\d{1})/, "$1 ($2) $3");    break;
            case 6: text = text.replace(/(\d{1})(\d{3})(\d{2})/, "$1 ($2) $3");    break;
            case 7: text = text.replace(/(\d{1})(\d{3})(\d{3})/, "$1 ($2) $3");    break;
            case 8: text = text.replace(/(\d{1})(\d{3})(\d{3})(\d{1})/, "$1 ($2) $3-$4");    break;
            case 9: text = text.replace(/(\d{1})(\d{3})(\d{3})(\d{2})/, "$1 ($2) $3-$4");    break;
            case 10: text = text.replace(/(\d{1})(\d{3})(\d{3})(\d{3})/, "$1 ($2) $3-$4");    break;
            case 11: text = text.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, "$1 ($2) $3-$4");    break;
        }

        $scope.user.Telephone=text;
    };
    $scope.GetGravatar=function(email){
        if(email){$scope.user.Gravatar='http://www.gravatar.com/avatar/'+md5.createHash(email)+'.jpg';}
    };
    $scope.CheckUID=function(){
        $scope.ViewButton=true;
        SystemUserFactory.CheckUID($routeParams.uid).success(function(data){
            console.log(data.Status)
            if(data.Status==false){
                $scope.ViewButton=false;
                $scope.Error=$rootScope.Page.Registration.Error;}
        }).error(function(data){
            $scope.ViewButton=false;
            $scope.Error=$rootScope.Page.Registration.Error;
        });
    };
    $scope.CheckUID();
    $scope.LoginIsValid=function(data){
        SystemUserFactory.LoginIsValid(data).success(function(data){
            $scope.LoginStatus=data.Status.Login;
        })
    };
}
function SystemUsersCtrl($rootScope,$scope,$routeParams,SystemUserFactory){
    $rootScope.Menu={ViewUsers:1};

    $scope.GetUsers=function(){
        SystemUserFactory.GetUsers().success(function(data){
            $scope.users=data.children;
        });
    };
    $scope.GetUsers();
    $scope.link=function(ID){
        location.href="#/User/"+ID;
    };
}
function ViewUserCtrl($rootScope,$scope,$routeParams,SystemUserFactory){
    $rootScope.Menu={ViewUsers:1};
    $scope.GetUsers=function(){
        SystemUserFactory.GetUserByID($routeParams.ID).success(function(data){
            $scope.user=data.children[0];
        });
    };
    $scope.GetUsers();
}

function ViewGroupsCtrl($rootScope,$scope,$routeParams,$alert,GroupFactory,GroupService){
    $rootScope.Menu={ViewGroups:1};
    $scope.GetAllGroups=function(){
        GroupFactory.GetAllGroups().success(function(data){
            $scope.allgroups=data.children.filter(function(element,index, viewcatalog){
                // Parsing element
                element.Tags=JSON.parse(element.Tags);
                return true;
            });
        });
    };
    $scope.GetMyGroups=function(){
        GroupFactory.GetMyGroups().success(function(data){
            $scope.mygroups=data.children.filter(function(element,index, viewcatalog){
                // Parsing element
                element.Tags=JSON.parse(element.Tags);
                return true;
            });
        });
    };
    $scope.GetAdminGroups=function(){
        GroupFactory.GetAdminGroups().success(function(data){
            $scope.admingroups=data.children.filter(function(element,index, viewcatalog){
                // Parsing element
                element.Tags=JSON.parse(element.Tags);
                return true;
            });
        });
    };
    $scope.GetAllGroups();
    $scope.GetMyGroups();
    $scope.GetAdminGroups();

    $scope.SetActiveTabs=function(){
        $routeParams.PartID? $scope.activeTab=$routeParams.PartID:  $scope.activeTab=0;
    };
    $scope.UserInvite=function(ID){
        GroupService.UserInvite(ID,function(data){
            var myAlert = $alert({title: $rootScope.Page.SuccessStatus["0"],
                content: $rootScope.Page.SuccessStatus["4"],
                placement: 'top-right',
                type: 'success',
                show: true,
                duration:3})
        });
    };
    $scope.tabs= [
        {
            "title": $rootScope.Page.Groups.AllGroups,
            "template": "partials/Groups/AllGroups.html"
        },
        {
            "title": $rootScope.Page.Groups.MyGroups,
            "template": "partials/Groups/MyGroups.html"
        },
        {
            "title": $rootScope.Page.Groups.AdminGroups,
            "template": "partials/Groups/AdminGroups.html"
        }
    ]


}
function ViewGroupCtrl($rootScope,$scope,$routeParams,GroupFactory,SystemUserFactory){
    $rootScope.Menu={ViewGroups:1};
    $scope.GetGroup=function(){
        GroupFactory.GetGroupByID($routeParams.ID).success(function(data){
            $scope.group=data.children[0];
        });
    };
    $scope.GetUsers=function(){
        SystemUserFactory.GetUsersByGroup($routeParams.ID).success(function(data){
            $scope.users=data.children;
        })
    };
    $scope.GetUsers();
    $scope.GetGroup();
}
function CreateGroupCtrl($rootScope,$scope,$routeParams,GroupFactory){
    $rootScope.Menu={ViewGroups:1};
    $scope.Submit=function(data){
        GroupFactory.Create(data).success(function(data){

        });
    };
}
function UpdateGroupCtrl($rootScope,$scope,$routeParams,GroupFactory){
    $rootScope.Menu={ViewGroups:1};
    $scope.Submit=function(data){
        GroupFactory.Update(data).success(function(data){ window.history.back();
        });
    };
    $scope.GetGroup=function(){
        GroupFactory.GetGroupByID($routeParams.ID).success(function(data){
            $scope.group=data.children[0];
        });
    };
    $scope.GetGroup();
}
function AdminGroupCtrl($rootScope,$scope,$routeParams,GroupFactory,SystemUserFactory,GroupService){
    $rootScope.Menu={ViewGroups:1};
    $scope.company=1; // Пользователи моей компании
    $scope.GetGroup=function(){
        GroupFactory.GetGroupByID($routeParams.ID).success(function(data){
            $scope.group=data.children[0];
        });
    };
    $scope.GetUsersByGroup=function(){
        SystemUserFactory.GetUsersByGroup($routeParams.ID).success(function(data){
            $scope.users=data.children;
        })
    };
    $scope.AddUserToGroup=function(User){
        var Group=$routeParams.ID;
        var data={"User":User,"Group":Group};
        GroupFactory.AddUserToGroup(data).success(function(){
            $scope.GetUsersByGroup();
            $scope.GetUsers();
        });
    };
    $scope.DeleteUser=function(data){
        GroupService.RemoveUserFromGroup(data,function(data){
            $scope.GetUsersByGroup();
            $scope.GetUsers();
        });
    };
    $scope.GetUsers=function(){
        SystemUserFactory.GetUsersByCompanyOrAllNotIsGroup($scope.company,$routeParams.ID).success(function(data){
            $scope.AllUsers=data.children;
        });
    };
    $scope.GetUsers();
    $scope.GetUsersByGroup();
    $scope.GetGroup();
    $scope.UserInvite=function(ID){
        GroupService.UserInvite(ID);
    }
}



function ViewTreesCtrl($rootScope,$scope,$routeParams,$alert,TreeFactory){
    $rootScope.Menu={TreeActive:1};

    $scope.SubTreeShow=false;
    $scope.ShowItems=function(item){   };
    $scope.SetShowItems=function(ind,items){
        var st=false;
        items.filter(function(element,index, viewcatalog){
            if(ind==index&&element.MasterTask==''){st=true}
            if(index>ind&&element.MasterTask==''){st=false}
            if(index>ind&&st){
                element.filter=!element.filter;
            }
            return true;
        });
    };
    $scope.set=function(item){
        $scope.ID=item.ID;
        $scope.Name=item.Name;
        $scope.ColLgSize=6;
        $scope.SubTreeShow=true;
    };
    $scope.cancel=function(){
        $scope.ID="";
        $scope.SubTreeShow=false;
        $scope.ColLgSize=12;
        $scope.Name="";
    };
    $scope.GetTrees=function(){
        $routeParams.ID? TreeFactory.GetTreeByID($routeParams.ID).success(function(data){$scope.trees=$scope.sort(data.children);}):
            TreeFactory.GetTrees().success(function(data){
                $scope.trees=$scope.sort(data.children);
            });
    };
    $scope.GetTrees();
    $scope.SetTree=function(ID,To){
        if(ID!=To){
            TreeFactory.SetTree(ID,To).success(function(data){
                $scope.cancel();
                $scope.GetTrees();
                if(To==0){
                    var myAlert = $alert({title: $rootScope.Page.SuccessStatus["0"],
                        content: $rootScope.Page.SuccessStatus["2"],
                        placement: 'top-right',
                        type: 'success',
                        show: true,
                        duration:3});
                }
                else{
                    var myAlert = $alert({title: $rootScope.Page.SuccessStatus["0"],
                        content: $rootScope.Page.SuccessStatus["3"],
                        placement: 'top-right',
                        type: 'success',
                        show: true,
                        duration:3});
                }
            });
        }
        else{
            var myAlert = $alert({title: $rootScope.Page.ErrorStatus["0"],
                content: $rootScope.Page.ErrorStatus["2"],
                placement: 'top-right',
                type: 'danger',
                show: true,
                duration:3});
        }

    };

    $scope.sort=function(data){
        var result=[];
        var DeleteItems=[];
        var temp=[];
        var SSN='';
        function insertArrayAt(array, index, arrayToInsert) {
            Array.prototype.splice.apply(array, [index, 0].concat(arrayToInsert));
            return array;
        }
        result=data.filter(function(element,index, viewcatalog){
            if(element.SSN.toString()==SSN.toString()){DeleteItems.push(index)}
            element.filter=true;
            return element.SSN.toString()==SSN.toString();
        });
        for(var l=DeleteItems.length-1;l>=0;l=l-1){data.splice(DeleteItems[l],1);}
        DeleteItems=[];
        while (data.length!=0){
            for(var i=0;i<=result.length-1;i++){
                if(result[i].SSN!=""){ SSN=result[i].SSN+"|"+result[i].ID}
                else{ SSN=result[i].ID}
                temp=data.filter(function(element,index, viewcatalog){
                    if(element.SSN.toString()==SSN.toString()){DeleteItems.push(index)}
                    element.filter=result[i].filter;
                    return element.SSN.toString()==SSN.toString();
                });
                if(temp.length>0){
                    insertArrayAt(result,i+1,temp);
                    for(var d=DeleteItems.length-1;d>=0;d--){data.splice(DeleteItems[d],1);}
                }
                DeleteItems=[];
            }
        }
        return result;
    }
}

function ViewMessagesCtrl($rootScope,$scope,$routeParams,$alert,CommentFactory){
    $rootScope.Menu={ViewMessages:1};
    $scope.GetMessages=function(){
        CommentFactory.GetComments().success(function(data){
            $scope.messages=data.children;
        });
    };
    $scope.GetMessages();

    $scope.SetActiveTabs=function(){
        $routeParams.PartId?$scope.activeTab=$routeParams.PartId:$scope.activeTab=0;
    };
    $scope.tabs= [
        {
            "title": "Задачи",
            "template": "partials/Messages/Tasks.html"
        },
        {
            "title": "Решения",
            "template": "partials/Messages/Solutions.html"
        },
        {
            "title": "Негативные",
            "template": "partials/Messages/Negative.html"
        }
    ]
}
function ViewEventsCtrl($rootScope,$http,$scope,$routeParams,$modal,$alert,EventFactory,TagsFactory,CommentService){
    $rootScope.Menu={ViewEvents:1};
    $scope.GetEvents=function(){
        EventFactory.GetEvents().success(function(data){
            $scope.events=data.children;
        });
    };
    $scope.GetEvents();
    $scope.m=function(){


    };


}

function ViewRoomCtrl($rootScope,$scope,$routeParams,$alert,$modal,RoomFactory,CommentFactory,TaskService,CommentService){
    $rootScope.Menu={RoomActive:1};$scope.comments=[];$scope.TechnoDocs=[];
    $scope.GetCommentByTask=function(ID,ViewTask){
        if(ViewTask) {CommentFactory.GetCommentByTask(ID).success(function (data) {
            $scope.comments[ID] = data.Comments.children;
            $scope.TechnoDocs[ID]=data.TechnoDocs;

            console.log($scope.TechnoDocs[ID]);
        });
        }
    };
    $scope.aceLoaded=function(ace){
        var code = ace.getSession().getValue();
        ace.getSession().setValue(window.atob(code));
    };
    $scope.StartTask=function(ID){
        RoomFactory.StartTask(ID).success(function(data){
            $scope.GetActiveTasks();
            $scope.GetTasksInTheWork();
            $scope.GetAFailedTasks();
            $scope.GetCompletedTasks();
        });
    };
    $scope.CancelTask=function(item){
        $scope.Name=item.Name;
        $scope.Ok=function(){
            RoomFactory.CancelTask(item.ID).success(function(){
                $scope.GetActiveTasks();
                $scope.GetTasksInTheWork();
                $scope.GetAFailedTasks();
                $scope.GetCompletedTasks();
            });
        };
        var modal=$modal({scope: $scope, backdrop:false, template: 'partials/modal/CancelTask.html', show: true});

    };
    $scope.EndTask=function(item,TechnoDocs){
        console.log(TechnoDocs)
        TaskService.EndTask(item,TechnoDocs,function(data){
            $scope.GetActiveTasks();
            $scope.GetTasksInTheWork();
            $scope.GetAFailedTasks();
            $scope.GetCompletedTasks();
        });
    };
    $scope.SetActiveTabs=function(){
        $routeParams.PartId?$scope.activeTab=$routeParams.PartId: $scope.activeTab=0;
    };
    $scope.GetActiveTasks=function(){
        RoomFactory.GetActiveTasks().success(function(data){
            $scope.ActiveTasks=data.children;
        });
    };
    $scope.GetActiveTasks();
    $scope.GetTasksInTheWork=function(){
        RoomFactory.GetTasksInTheWork().success(function(data){
            $scope.TasksInTheWork=data.children;
        });
    };
    $scope.GetTasksInTheWork();
    $scope.GetAFailedTasks=function(){
        RoomFactory.GetAFailedTasks().success(function(data){
            $scope.AFailedTasks=data.children;
        });
    };
    $scope.GetAFailedTasks();
    $scope.GetCompletedTasks=function(){
        RoomFactory.GetCompletedTasks().success(function(data){
            $scope.CompletedTasks=data.children;
        });
    };
    $scope.GetCompletedTasks();
    $scope.CreateCommentForTask=function(item){
        CommentService.CreateCommentForTask(item,function(data){
            $scope.GetCommentByTask(item.ID,1);
        });
    };
    $scope.UpdateComment=function(task,ID){
        CommentService.UpdateComment(ID,function(data){
            $scope.GetCommentByTask(task.ID,1);
        });
    }
    $scope.tabs= [
        {
            "title": $rootScope.Page.Room.ViewActiveTasks,
            "template": "partials/Room/ActiveTasks.html"
        }
        ,
        {
            "title":  $rootScope.Page.Room.ViewTasksInTheWork,
            "template": "partials/Room/TasksInTheWork.html"
        }
        ,
        {
            "title":  $rootScope.Page.Room.ViewCompletedTasks,
            "template": "partials/Room/CompletedTasks.html"
        }
        ,
        {
            "title":  $rootScope.Page.Room.ViewAFailedTasks,
            "template": "partials/Room/AFailedTasks.html"
        }
    ]
}

function ViewTopMenuCtrl($rootScope,$scope,$routeParams,$alert,$modal,$cookies,AuthFactory,SearchFactory){
    var modal;
    $scope.ModalLogin=function(){
        modal=$modal({scope: $scope, backdrop:false, template: 'partials/modal/Login.html', show: true});
    };
    $scope.Login=function(data){
        AuthFactory.Login(data).success(function(data){
            $scope.success=data;
            if($scope.success.Status.Success){modal.hide();$scope.error="";$scope.Start();location.reload();}
            else{$scope.error=$rootScope.Page.ErrorStatus["3"]}
        });
    };
    $scope.Logout=function(data){
        AuthFactory.Logout(data).success(function(data){
            $cookies.ScrumblerData='';
            $scope.Start();
            $scope.success=data;
        });
    };
    $scope.Start=function(){
        $scope.ViewLoginForm=1;
        if(AuthFactory.Get().Gravatar()!=""&&AuthFactory.Get().Name()!=""){
            $scope.Gravatar=AuthFactory.Get().Gravatar();
            $scope.Name=AuthFactory.Get().Name();
            $rootScope.Success=true;
            $scope.ViewLoginForm=0;
        }else{$rootScope.Success=false;}
    };
    $scope.Start();
    $scope.SubmitSearch=function(text){
        if(text!=""){
            location.href="#/Search"
        }
    };
    $scope.Search=function(text){
        if(text!=""){
            SearchFactory.SearchText(text).success(function(data){
                var array = data[0].children;
                for(var i=1;i<=data.length-1;i++){
                    array= array.concat(data[i].children);
                }
                $rootScope.SearchData=array;
            });
        }
        if(text==""){$rootScope.SearchData=[];}
    };
}


function ViewCompanyCtrl($rootScope,$scope,$routeParams,$alert,$modal,CompanyFactory){
    $rootScope.Menu={CompanyActive:1};
    $scope.GetCompany=function(){
        CompanyFactory.GetCompany($routeParams.ID).success(function(data){
            $scope.company=data.children;
        })
    };
    $scope.GetCompany();
}
function ViewCompaniesCtrl($rootScope,$scope,$routeParams,$alert,$modal,CompanyFactory){
    $rootScope.Menu={CompanyActive:1};
    $scope.GetCompanies=function(){
        CompanyFactory.GetCompanies().success(function(data){
            $scope.companies=data.children;
        })
    };
    $scope.GetCompanies();
}
function CreateCompanyCtrl($rootScope,$scope,$routeParams,$alert,$modal,md5,CompanyFactory,SystemUserFactory){
    $rootScope.Menu={CompanyActive:1};
    $scope.submit=function(data){
        CompanyFactory.Create(data).success(function(){        location.href="#/Companies"     }).error(function(){
          var myAlert = $alert({title: $rootScope.Page.ErrorStatus["0"],
                content: $rootScope.Page.ErrorStatus["4"],
                placement: 'top-right',
                type: 'danger',
                show: true,
                duration:3});
        });
    };
    $scope.GetCompaniesList=function(){
        CompanyFactory.GetCompaniesFromVacancy().success(function(data){
            $scope.companies=data.children;
        });
    };
    $scope.SetNameAndImage=function(list,ID){
        $scope.company.Name=list.filter(function(element,index, viewcatalog){
            return element.ID==ID;
        })[0].Name;
        $scope.company.Image=list.filter(function(element,index, viewcatalog){
            return element.ID==ID;
        })[0].Image;
    };

    $scope.GetCompaniesList();

    $scope.PhoneNumberFilter=function(text){
        text = text.replace(/[^0-9]/g, '');
        if(text.length>11){text=text.substring(0,11)}
        switch (text.length){
            case 1: text = text.replace(/^8/, "7");    break;
            case 5: text = text.replace(/(\d{1})(\d{3})(\d{1})/, "$1 ($2) $3");    break;
            case 6: text = text.replace(/(\d{1})(\d{3})(\d{2})/, "$1 ($2) $3");    break;
            case 7: text = text.replace(/(\d{1})(\d{3})(\d{3})/, "$1 ($2) $3");    break;
            case 8: text = text.replace(/(\d{1})(\d{3})(\d{3})(\d{1})/, "$1 ($2) $3-$4");    break;
            case 9: text = text.replace(/(\d{1})(\d{3})(\d{3})(\d{2})/, "$1 ($2) $3-$4");    break;
            case 10: text = text.replace(/(\d{1})(\d{3})(\d{3})(\d{3})/, "$1 ($2) $3-$4");    break;
            case 11: text = text.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, "$1 ($2) $3-$4");    break;
        }

        $scope.company.Telephone=text;
    };
    $scope.GetGravatar=function(email){
        if(email){$scope.company.Gravatar='http://www.gravatar.com/avatar/'+md5.createHash(email)+'.jpg';}
    };

    $scope.LoginIsValid=function(data){
        SystemUserFactory.LoginIsValid(data).success(function(data){
            $scope.LoginStatus=data.Status.Login;
        })
    };


}
function UpdateCompanyCtrl($rootScope,$scope,$routeParams,$alert,$modal,CompanyFactory){
    $rootScope.Menu={CompanyActive:1};
    $scope.submit=function(data){
        CompanyFactory.Update(data).success(function(){

        });
    };
}
function ViewSettingsCtrl($rootScope,$scope,$routeParams,$alert,$modal,TagsFactory,TipService,TipFactory,TechnoDocService,SystemUserFactory,GitHubFactory){
    $rootScope.Menu={ViewSettings:1};
    $scope.DeleteTag=function(data){
        TagsFactory.DeleteTag(data).success(function(){

        });
    };
    $scope.AddTag=function(item){
        if(!item.ID){TagsFactory.Create(item).success(function(data){return  item.ID=data.ID;})}
    };
    $scope.LoadTags = function(query) {
        return TagsFactory.GetTags(query);
    };
    $scope.LoadAllTags = function() {
        return TagsFactory.GetTags2().success(function(data){
            $scope.tags=data.children;
        });
    };
    $scope.LoadAllTags();
    $scope.LoadAllTips=function(){
        TipFactory.GetAll().success(function(data){
            $scope.tips=data.children;
        })
    };
    $scope.LoadAllTips();
    $scope.CreateTip=function(){
        TipService.Create(function(){
            $scope.LoadAllTips();
        });
    };
    $scope.Update=function(item){
        TipService.Update(item,function(){
            $scope.LoadAllTips();
        });
    };
    $scope.DeleteTip=function(ID){
        TipFactory.Delete(ID).success(function(){
            $scope.LoadAllTips();
        });
    };
    $scope.ViewTip=function(){
        TipService.View();
    };


    $scope.CreateIssue=function(data){
        GitHubFactory.CreateIssue(data).success(function(){

        })
    }

    $scope.ChangeGitHubLogin=function(data){
        SystemUserFactory.UpdateGitHubLogin(data).success(function(data){});
    };
    $scope.SetActiveTabs=function(){
        $routeParams.PartId?$scope.activeTab=$routeParams.PartId: $scope.activeTab=0;
    };
    $scope.tabs= [
        {
            "title": $rootScope.Page.Settings.Tags.Tags,
            "template": "partials/Settings/Tags.html"
        },
        {
            "title": $rootScope.Page.Settings.Tips.Tips,
            "template": "partials/Settings/Tips.html"
        },
        {
            "title": $rootScope.Page.Settings.GitHub.GitHubLogin,
            "template": "partials/Settings/GitHub.html"
        }
    ];
    $scope.Annotation="";
    $scope.Targets=[];
    $scope.Sources=[];
    $scope.SourceTexts=[];
    $scope.test=function(Annotation,Targets,Sources,SourceTexts){
        TechnoDocService.Create(Annotation,Targets,Sources,SourceTexts,function(Annotation,Targets,Sources,SourceTexts){
            $scope.Annotation=Annotation;
            $scope.Targets=Targets;
            $scope.Sources=Sources;
            $scope.SourceTexts=SourceTexts;
        })
    };
}
function ViewTemplateCtrl($rootScope,$scope,$routeParams,$alert,$modal,TemplateFactory){
    $rootScope.Menu={ViewTemplate:1};
    $scope.GetNameSpaceList=function(){
        TemplateFactory.GetNameSpaceList().success(function(data){
            $scope.NameSpaceList=data.children;
        });
    };
    $scope.GetClassList=function(text){
        TemplateFactory.GetClassList(text).success(function(data){
            $scope.ClassList=data.children;
        });
    };
    $scope.GetNameSpaceList();
    $scope.Create=function(NameSpace,Package){
        TemplateFactory.Create(NameSpace,Package).success(function(data){

        });
    };
}




