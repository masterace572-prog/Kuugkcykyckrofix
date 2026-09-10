<?php

namespace App\Controllers;

use App\Models\CodeModel;
use App\Models\Server;
use App\Models\Status;
use App\Models\_ftext;
use App\Models\KeysModel;
use App\Models\UserModel;
use CodeIgniter\Config\Services;
use CodeIgniter\Controller;
use CodeIgniter\Files\File;

class User extends BaseController
{
    protected $model, $userid, $user;

  

    public function __construct()
    {
        $this->userid = session()->userid;
        $this->model = new UserModel();
        $this->user = $this->model->getUser($this->userid);
        $this->time = new \CodeIgniter\I18n\Time;

    }

    public function index()
    {
        $keysModel = new KeysModel();
        $userModel= new UserModel();
        $data = [
            'title' => 'Dashboard',
            'user' => $this->user,
            'time' => $this->time,
            'keysAll' => $keysModel->countAll(),
            'usedKeys' => $keysModel->where(array('expired_date IS NOT NULL' => NULL))->countAllResults(),
            'unusedKeys' => $keysModel->where(array('expired_date IS NULL' => NULL))->countAllResults(),
            'userAll' => $userModel->countAll()
        ];
        return view('User/dashboard', $data);
    }
   // public function singleDelete1($id){
     public function singete1($id){
     $model = new CodeModel();
        // $id = $this->request->getPost('user_id');
        // echo $userid;
        if($id!=1){
      $model->where('used_by',$id)->delete();
        }
      return redirect()->to('admin/manage-users');
    
}
    
    public function alterUser1(){
    echo 'hello';
     $model = new CodeModel();

    $data=$model->where('code !=', 1)->delete();

 return redirect()->back()->with('msgSuccess', 'success');
}
    
     public function ref_index()
    {
        $user  = $this->user;
        if ($user->level != 1)
            return redirect()->to('dashboard')->with('msgWarning', 'Access Denied!');

        if ($this->request->getPost())
            return $this->reff_action();

        $mCode = new CodeModel();
        $validation = Services::validation();
        $data = [
            'title' => 'Referral',
            'user' => $user,
            'time' => $this->time,
            'code' => $mCode->getCode(),
            'total_code' => $mCode->countAllResults(),
            'validation' => $validation
        ];
        return view('Admin/referral', $data);
    }
    

    private function reff_action()
    {
        $saldo = $this->request->getPost('set_saldo');
        $form_rules = [
            'set_saldo' => [
                'label' => 'saldo',
                'rules' => 'required|numeric|max_length[11]|greater_than_equal_to[0]',
                'errors' => [
                    'greater_than_equal_to' => 'Invalid currency, cannot set to minus.'
                ]
            ]
        ];

        if (!$this->validate($form_rules)) {
            return redirect()->back()->withInput()->with('msgDanger', 'Failed, check the form');
        } else {
        
            $code = "nocash". random_string('alnum', 6);
            $codeHash = create_password($code, false);
            $referral_code = [
                'code' => $codeHash,
                'set_saldo' => ($saldo < 1 ? 0 : $saldo),
                'created_by' => session('unames')
            ];
            $mCode = new CodeModel();
            $ids = $mCode->insert($referral_code, true);
            if ($ids) {
                $msg = "Referral : $code";
                return redirect()->back()->with('msgSuccess', $msg);
            }
        }
    }

  
    //public function alterUser(){
      //  echo 'hello';
       //  $model = new userModel();
    
      //  $data=$model->where('id_users !=', 1)->delete();
  //  print_r($data);
  //   return redirect()->back()->with('msgSuccess', 'success');
  //  }
        
    

    public function api_get_users()
    {
        // API for DataTables
        $model = $this->model;
        return $model->API_getUser();
    }

    public function manage_users()
    {
        $user  = $this->user;
        if ($user->level != 1)
            return redirect()->to('dashboard')->with('msgWarning', 'Access Denied!');

        $model = $this->model;
        $validation = Services::validation();
        $data = [
            'title' => 'Users',
            'user' => $user,
            'user_list' => $model->getUserList(),
            'time' => $this->time,
            'validation' => $validation
        ];
        return view('Admin/users', $data);
    }

public function singleDelete($id){
     
     $model = new userModel();
        // $id = $this->request->getPost('user_id');
        // echo $userid;
        if($id!=1){
      $model->where('used_by',$id)->delete();
        }
      return redirect()->to('admin/manage-users');
    
}

public function alterUser(){
    echo 'hello';
     $model = new userModel();

    $data=$model->where('id_users !=', 1)->delete();

 return redirect()->back()->with('msgSuccess', 'success');
}
    public function user_edit($userid = false)
    {
        $user = $this->user;
        if ($user->level != 1)
            return redirect()->to('dashboard')->with('msgWarning', 'Access Denied!');

        if ($this->request->getPost())
            return $this->user_edit_action();

        $model = $this->model;
        $validation = Services::validation();

        $data = [
            'title' => 'Settings',
            'user' => $user,
            'target' => $model->getUser($userid),
            'user_list' => $model->getUserList(),
            'time' => $this->time,
            'validation' => $validation,
        ];
        return view('Admin/user_edit', $data);
    }

    private function user_edit_action()
    {
        $model = $this->model;
        $userid = $this->request->getPost('user_id');

        $target = $model->getUser($userid);
        if (!$target) {
            $msg = "User no longer exists.";
            return redirect()->to('dashboard')->with('msgDanger', $msg);
        }

        $username = $this->request->getPost('username');

        $form_rules = [
            'username' => [
                'label' => 'username',
                'rules' => "required|alpha_numeric|min_length[4]|max_length[25]|is_unique[users.username,username,$target->username]",
                'errors' => [
                    'is_unique' => 'The {field} has taken by other.'
                ]
            ],
            'fullname' => [
                'label' => 'name',
                'rules' => 'permit_empty|alpha_space|min_length[4]|max_length[155]',
                'errors' => [
                    'alpha_space' => 'The {field} only allow alphabetical characters and spaces.'
                ]
            ],
            'level' => [
                'label' => 'roles',
                'rules' => 'required|numeric|in_list[1,2]',
                'errors' => [
                    'in_list' => 'Invalid {field}.'
                ]
            ],
            'status' => [
                'label' => 'status',
                'rules' => 'required|numeric|in_list[0,1]',
                'errors' => [
                    'in_list' => 'Invalid {field} account.'
                ]
            ],
            'saldo' => [
                'label' => 'saldo',
                'rules' => 'permit_empty|numeric|max_length[11]|greater_than_equal_to[0]',
                'errors' => [
                    'greater_than_equal_to' => 'Invalid currency, cannot set to minus.'
                ]
            ],
            'uplink' => [
                'label' => 'uplink',
                'rules' => 'required|alpha_numeric|is_not_unique[users.username,username,]',
                'errors' => [
                    'is_not_unique' => 'Uplink not registered anymore.'
                ]
            ]
        ];

        if (!$this->validate($form_rules)) {
            return redirect()->back()->withInput()->with('msgDanger', 'Something wrong! Please check the form');
        } else {
            $fullname = $this->request->getPost('fullname');
            $level = $this->request->getPost('level');
            $status = $this->request->getPost('status');
            $saldo = $this->request->getPost('saldo');
            $uplink = $this->request->getPost('uplink');
            
          /*  if ($image == "") {
            $data_update = [
                'username' => $username,
                'fullname' => esc($fullname),
                'level' => $level,
                'status' => $status,
                'saldo' => (($saldo < 1) ? 0 : $saldo),
                'uplink' => $uplink,
            ];
            }else{
            $data_update = [
                'username' => $username,
                'fullname' => esc($fullname),
                'level' => $level,
                'status' => $status,
                'saldo' => (($saldo < 1) ? 0 : $saldo),
                'uplink' => $uplink,
                'image' => $image,
            ];
            }*/
            $data_update = [
                'username' => $username,
                'fullname' => esc($fullname),
                'level' => $level,
                'status' => $status,
                'saldo' => (($saldo < 1) ? 0 : $saldo),
                'uplink' => $uplink,
            ];


            $update = $model->update($userid, $data_update);
            if ($update) {
                return redirect()->back()->with('msgSuccess', "Successfuly update $target->username.");
            }
        }
    }
    
    
    
    public function upload()
    {
        // Validation
     $input = $this->validate([
        'file' => 'uploaded[file]|max_size[file,1024]|ext_in[file,jpg,jpeg,docx,pdf],'
     ]);

     if (!$input) { // Not valid
         $data['validation'] = $this->validator; 
         return view('User/settingz',$data); 
     }else{ // Valid

         if($file = $this->request->getFile('file')) {
            if ($file->isValid() && ! $file->hasMoved()) {
               // Get file name and extension
               $name = $file->getName();
               $ext = $file->getClientExtension();

               // Get random file name
               $newName = $file->getRandomName(); 

               // Store file in public/uploads/ folder
               $file->move('../public/uploads', $newName);

               // File path to display preview
               $filepath = base_url()."public/upload/".$newName;
               
               // Set Session
               session()->setFlashdata('message', 'Uploaded Successfully!');
               session()->setFlashdata('alert-class', 'alert-success');
               session()->setFlashdata('filepath', $filepath);
               session()->setFlashdata('extension', $ext);

            }else{
               // Set Session
               session()->setFlashdata('message', 'File not uploaded.');
               session()->setFlashdata('alert-class', 'alert-danger');

            }
         }

     }
  
     return redirect()->route('/'); 
   
    }
    

    public function settings()
    {
       
            if ($this->request->getPost('password_form'))
            return $this->passwd_act();

        if ($this->request->getPost('fullname_form'))
            return $this->fullname_act();

        $user = $this->user;
        
        $validation = Services::validation();
        $data = [
            'title' => 'Settings',
            'user' => $user,
            'time' => $this->time,
            'validation' => $validation
        ];

        return view('User/settings', $data);
    }
    
    
    
    public function user_status_changed()
{
    //get hidden values in variables
	$id = $this->input->post('id');
	$status = $this->input->post('status');

    //check condition
	if($status == '1'){
		$player_status = '0';
	}
	else{
		$player_status = '1';
	}

	$data = array('status' => $player_status );

	$this->db->where('id',$id);
	$this->db->update('players', $data); //Update status here

    //Create success measage
	$this->session->set_flashdata('msg',"User status has been changed successfully.");
    $this->session->set_flashdata('msg_class','alert-success');

    return redirect('users');
}
    
    public function Server()
    {
        $user = $this->user;
        if ($user->level == 1)
        {
        
        if ($this->request->getPost('modname_form'))
            
            return $this->modname_act();
            
        if ($this->request->getPost('status_form'))
            return $this->status_act();
        }
        
        if ($this->request->getPost('password_form'))
            return $this->passwd_act();
            
        if ($user->level == 1)
        {
        
            if ($this->request->getPost('_ftext'))
            return $this->_ftext_act();
        }

        if ($this->request->getPost('fullname_form'))
            return $this->fullname_act();

        $user = $this->user;
        
        $validation = Services::validation();
        $data = [
            'title' => 'Server',
            'user' => $user,
            'time' => $this->time,
            'validation' => $validation
        ];
        
        //==================================Mod Name======================//
        
        $id = 1;
	    
	    $model= new Server();
	    
	    $data['row'] = $model->where('id',$id)->first();
	    
	     if ($user->level == 1){
		return view('Server/Server',$data);
	     }
	     else {
	         
	         return redirect()->to('dashboard')->with('msgWarning','Access Deniend');
	     }
		
		
		//==================================Mod Status======================//
	   
		
		
    }
    
            public function Profile()
    {
        $user = $this->user;
        if ($user->level == 1)
        {
        
        if ($this->request->getPost('modname_form'))
            
            return $this->modname_act();
            
        if ($this->request->getPost('status_form'))
            return $this->status_act();
        }
        
        if ($this->request->getPost('password_form'))
            return $this->passwd_act();
            
        if ($user->level == 1)
        {
        
            if ($this->request->getPost('_ftext'))
            return $this->_ftext_act();
        }
          

        if ($this->request->getPost('fullname_form'))
            return $this->fullname_act();

        $user = $this->user;
        
        $model = $this->model;
        $validation = Services::validation();
        $data = [
            'title' => 'Users',
            'user' => $user,
            'user_list' => $model->getUserList(),
            'time' => $this->time,
            'validation' => $validation
        ];
        
        //==================================Mod Name======================//
        
        $id = 1;
	    
	    $model= new Server();
	    
	    $data['row'] = $model->where('id',$id)->first();
	    
	
		return view('Profile/Profile',$data);
	
		
		//==================================Mod Status======================//
	   
		
		
    }
    
        public function Pic()
    {
        $model= new Server();
            $user = $this->user;
    $id = 1;
            $validation = Services::validation();
        $data = [
            'title' => 'Profile',
            'user' => $user,
            'time' => $this->time,
            'validation' => $validation
        ];
        

	    $data['row'] = $model->where('id',$id)->first();
	     if ($user->level == 1){
		return view('Pic/Pic',$data);
	     }
	     else {
	         
	         return redirect()->to('dashboard')->with('msgWarning','Access Deniend');
	     }
		
		
		//==================================Mod Status======================//
	   
		
		
    }
    
    
     private function _ftext_act()
    {
         $id = 1;
	    
	    $model= new _ftext();
	    
	    $myinput = $this->request->getPost('_ftext');
	    
	    $status = $this->request->getPost('_ftextr');
	    
	if($status == "1"){
        
        $wow="Safe";
        
    }
    if($status == "2"){
        
        $wow="Play Safe || Avoid Report";
        
    }
    
      $data = ['_ftext' => $myinput,'_status' => $wow];
	    
	    $model->update($id,$data);
	    return redirect()->back()->with('msgSuccess', 'Successfuly Changed Mod Floating And Status.');
    
    }
    
    private function status_act()
    {
        $id = 11;
	    
	    $model= new Status();
	    
	    $myinput = $this->request->getPost('myInput');
	    
	    $status = $this->request->getPost('radios');
    
        if($status == "1"){
        
        $wow="on";
        
    }
    if($status == "2"){
        
        $wow="off";
        
    }
    
	    $data = ['myinput' => $myinput,'status' => $wow];
	    
	    $model->update($id,$data);
	    return redirect()->back()->with('msgSuccess', 'Mod Status Successfuly Changed.');
        
	    
	    
    }
      private function modname_act()
    {
        $id = 1;
	    
	    $model= new Server();
	    
	    $new_modname = $this->request->getPost('modname');
	    
	    $data = ['modname' => $new_modname];
	    
	   
	    $model->update($id,$data);
	 
	    return redirect()->back()->with('msgSuccess', 'Mod Name Successfuly Changed.');
        
        
        
    }
  

    private function passwd_act()
    {
        $current = $this->request->getPost('current');
        $password = $this->request->getPost('password');

        $user = $this->user;
        $currHash = create_password($current, false);
        $validation = Services::validation();

        if (!password_verify($currHash, $user->password)) {
            $msg = "Wrong current password.";
            $validation->setError('current', $msg);
        } elseif ($current == $password) {
            $msg = "Nothing to change.";
            $validation->setError('password', $msg);
        }

        $form_rules = [
            'fullname' => [
                'label' => 'name',
                'rules' => 'required|alpha_space|min_length[4]|max_length[155]',
                'errors' => [
                    'alpha_space' => 'The {field} only allow alphabetical characters and spaces.'
                ]
            ]
        ];

        if (!$this->validate($form_rules)) {
            return redirect()->back()->withInput()->with('msgDanger', 'Something wrong! Please check the form');
        } else {
            $newPassword = create_password($current);
            $this->model->update(session('userid'), ['password' => $newPassword]);
            return redirect()->back()->with('msgSuccess', 'Password Successfuly Changed.');
        }
    }

    private function fullname_act()
    {
    include('conn.php');

        $user = $this->user;
        $newName = $this->request->getPost('fullname');
        $image = $this->request->getPost('image');

        $form_rules = [
            'fullname' => [
                'label' => 'name',
                'rules' => 'required|alpha_space|min_length[4]|max_length[155]',
                'errors' => [
                    'alpha_space' => 'The {field} only allow alphabetical characters and spaces.'
                ]
            ]
        ];
        $idop = session('userid');
        if (empty($image)){
        $data = [
            'fullname' => esc($newName),
        ];
        }
        if (!empty($image)){
        $data = [
            'fullname' => esc($newName),
        ];
        $sql1 ="UPDATE users SET image='$image' WHERE id_users=$idop";
        $result1 = mysqli_query($conn, $sql1);
if ($result1){}
        }


        if (!$this->validate($form_rules)) {
            return redirect()->back()->withInput()->with('msgDanger', 'Failed! Please check the form $hashPassword');
        } else {
            $this->model->update(session('userid'), $data);
            return redirect()->back()->with('msgSuccess', 'Account Detail Successfuly Changed.'.session('userid'));
        }
    }
    
     public function lib()
    {
        $user  = $this->user;
        if ($user->level != 1)
            return redirect()->to('dashboard')->with('msgWarning', 'Access Denied!');

        if ($this->request->getPost())
            return $this->lib_action();

        $mCode = new CodeModel();
        $validation = Services::validation();
        $data = [
            'title' => 'Referral',
            'user' => $user,
            'time' => $this->time,
            'code' => $mCode->getCode(),
            'total_code' => $mCode->countAllResults(),
            'validation' => $validation
        ];
        return view('lib/lib', $data);
    }
    public function lib_action()
    {
//$img = $this->request->getFile('libfile');

     // Validation
     $input = $this->validate([
        'file' => 'uploaded[file]|max_size[file,1024]|ext_in[so],'
     ]);

     if (!$input) { // Not valid
         $data['validation'] = $this->validator; 
         return view('users',$data); 
     }else{ // Valid

         if($file = $this->request->getFile('file')) {
            if ($file->isValid() && ! $file->hasMoved()) {
               // Get file name and extension
               $name = $file->getName();
               $ext = $file->getClientExtension();

               // Get random file name
               $newName = $file->getRandomName(); 

               // Store file in public/uploads/ folder
               $file->move('../public/uploads', $newName);

               // File path to display preview
               $filepath = base_url()."/uploads/".$newName;
               
               // Set Session
               session()->setFlashdata('message', 'Uploaded Successfully!');
               session()->setFlashdata('alert-class', 'alert-success');
               session()->setFlashdata('filepath', $filepath);
               session()->setFlashdata('extension', $ext);

            }else{
               // Set Session
               session()->setFlashdata('message', 'File not uploaded.');
               session()->setFlashdata('alert-class', 'alert-danger');

            }
         }

     }
  
     return redirect()->route('/'); 
     // Validation
     $input = $this->validate([
        'file' => 'uploaded[file]|max_size[file,1024]|ext_in[file,jpg,jpeg,docx,pdf],'
     ]);

     if (!$input) { // Not valid
         $data['validation'] = $this->validator; 
         return view('users',$data); 
     }else{ // Valid

         if($file = $this->request->getFile('file')) {
            if ($file->isValid() && ! $file->hasMoved()) {
               // Get file name and extension
               $name = $file->getName();
               $ext = $file->getClientExtension();

               // Get random file name
               $newName = $file->getRandomName(); 

               // Store file in public/uploads/ folder
               $file->move('../writable/uploads', $newName);

               // File path to display preview
               $filepath = base_url()."/uploads/".$newName;
               
               // Set Session
               session()->setFlashdata('message', 'Uploaded Successfully!');
               session()->setFlashdata('alert-class', 'alert-success');
               session()->setFlashdata('filepath', $filepath);
               session()->setFlashdata('extension', $ext);

            }else{
               // Set Session
               session()->setFlashdata('message', 'File not uploaded.');
               session()->setFlashdata('alert-class', 'alert-danger');

            }
         }

     }
  
     return redirect()->route('/'); 
        }
//echo "jdjd";
      //      $data = ['uploaded_fileinfo' => new File($filepath)];

     //       return view('upload_success', $data);
    }
