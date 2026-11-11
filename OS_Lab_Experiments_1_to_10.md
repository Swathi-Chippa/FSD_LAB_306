# Operating Systems Lab -- Experiments 1--10

## Final short C programs and Bash scripts

**Environment:** Ubuntu/Linux or WSL. Save each C program in a separate
`.c` file and each shell program in a separate `.sh` file.

**Compile ordinary C programs:**

``` bash
gcc file.c -o file
./file
```

**Compile programs using pthreads/semaphores:**

``` bash
gcc file.c -o file -pthread
./file
```

**Run shell scripts:**

``` bash
chmod +x file.sh
./file.sh
```

------------------------------------------------------------------------

# Experiment 1 -- Linux/Unix File-Related System Calls

## 1A. File calls: mkdir, open, write, lseek, read, close, link, chmod, stat, unlink, sync

``` c
#include <stdio.h>
#include <fcntl.h>
#include <unistd.h>
#include <sys/stat.h>

int main() {
    int fd;
    char b[30];
    struct stat s;

    mkdir("test", 0777);
    fd = open("test/a.txt", O_CREAT | O_RDWR, 0666);
    write(fd, "Hello Linux", 11);
    lseek(fd, 0, SEEK_SET);
    read(fd, b, 11);
    b[11] = '\0';
    printf("File: %s\n", b);
    close(fd);

    link("test/a.txt", "test/b.txt");
    chmod("test/a.txt", 0644);
    stat("test/a.txt", &s);
    printf("Size: %ld\n", (long)s.st_size);
    unlink("test/b.txt");
    sync();
    printf("System calls executed\n");
    return 0;
}
```

## 1B. chown

``` c
#include <stdio.h>
#include <unistd.h>

int main() {
    if (chown("test/a.txt", getuid(), getgid()) == 0)
        printf("Owner changed\n");
    else
        perror("chown");
    return 0;
}
```

## 1C. umask

``` c
#include <stdio.h>
#include <fcntl.h>
#include <unistd.h>
#include <sys/stat.h>

int main() {
    umask(0022);
    int fd = open("sample.txt", O_CREAT | O_WRONLY, 0666);
    if (fd < 0) { perror("open"); return 1; }
    close(fd);
    printf("File created\n");
    return 0;
}
```

## 1D. Mount and unmount (terminal commands)

``` bash
sudo mkdir -p /mnt/demo
sudo mount -t tmpfs tmpfs /mnt/demo
mount | grep /mnt/demo
sudo umount /mnt/demo
```

------------------------------------------------------------------------

# Experiment 2 -- Linux/Unix Process-Related System Calls

## 2A. fork()

``` c
#include <stdio.h>
#include <unistd.h>

int main() {
    int p = fork();
    if (p == 0) printf("Child process\n");
    else if (p > 0) printf("Parent process\n");
    else perror("fork");
    return 0;
}
```

## 2B. wait()

``` c
#include <stdio.h>
#include <unistd.h>
#include <sys/wait.h>

int main() {
    if (fork() == 0) {
        printf("Child process\n");
        sleep(1);
    } else {
        wait(NULL);
        printf("Parent resumes\n");
    }
    return 0;
}
```

## 2C. exec()

``` c
#include <stdio.h>
#include <unistd.h>

int main() {
    printf("Before exec\n");
    execlp("ls", "ls", NULL);
    perror("exec");
    return 1;
}
```

## 2D. exit()

``` c
#include <stdio.h>
#include <stdlib.h>

int main() {
    printf("Program starts\n");
    exit(0);
    printf("This will not print\n");
}
```

## 2E. getpid() and getuid()

``` c
#include <stdio.h>
#include <unistd.h>

int main() {
    printf("Process ID = %d\n", getpid());
    printf("User ID = %d\n", getuid());
    return 0;
}
```

## 2F. setuid() (changing to the current UID; changing to another UID may require root)

``` c
#include <stdio.h>
#include <unistd.h>

int main() {
    printf("Current UID = %d\n", getuid());
    if (setuid(getuid()) == 0) printf("setuid successful\n");
    else perror("setuid");
    return 0;
}
```

## 2G. brk()

``` c
#include <stdio.h>
#include <unistd.h>

int main() {
    void *p = sbrk(0);
    printf("Current break = %p\n", p);
    if (p != (void *)-1 && brk((char *)p + 1024) == 0)
        printf("Break increased\n");
    else
        perror("brk");
    return 0;
}
```

## 2H. nice()

``` c
#include <stdio.h>
#include <unistd.h>

int main() {
    int n = nice(5);
    if (n == -1) perror("nice");
    else printf("New nice value = %d\n", n);
    return 0;
}
```

## 2I. sleep()

``` c
#include <stdio.h>
#include <unistd.h>

int main() {
    printf("Sleeping for 5 seconds...\n");
    sleep(5);
    printf("Awake!\n");
    return 0;
}
```

------------------------------------------------------------------------

# Experiment 3 -- Shell Programming

## 3A. Prime number

``` bash
echo "Enter number:"
read n
flag=0
for ((i=2; i<=n/2; i++)); do
    if (( n%i == 0 )); then flag=1; break; fi
done
if (( n>1 && flag==0 )); then echo "$n is prime"
else echo "$n is not prime"; fi
```

## 3B. Palindrome number

``` bash
echo "Enter number:"
read n
x=$n
rev=0
while (( x>0 )); do
    r=$((x%10))
    rev=$((rev*10+r))
    x=$((x/10))
done
if (( rev==n )); then echo "$n is palindrome"
else echo "$n is not palindrome"; fi
```

## 3C. Armstrong number (three-digit version)

``` bash
echo "Enter a three-digit number:"
read n
x=$n
sum=0
while (( x>0 )); do
    r=$((x%10))
    sum=$((sum+r*r*r))
    x=$((x/10))
done
if (( sum==n )); then echo "$n is Armstrong"
else echo "$n is not Armstrong"; fi
```

## 3D. Decimal to binary

``` bash
echo "Enter decimal number:"
read n
bin=""
if (( n==0 )); then bin=0
else
    while (( n>0 )); do
        bin="$((n%2))$bin"
        n=$((n/2))
    done
fi
echo "Binary = $bin"
```

## 3E. Decimal to base 5

``` bash
echo "Enter decimal number:"
read n
base=""
if (( n==0 )); then base=0
else
    while (( n>0 )); do
        base="$((n%5))$base"
        n=$((n/5))
    done
fi
echo "Base 5 = $base"
```

## 3F. Base 5 to decimal

``` bash
echo "Enter base 5 number:"
read n
dec=0
pow=1
while (( n>0 )); do
    r=$((n%10))
    if (( r>4 )); then echo "Invalid base-5 number"; exit 1; fi
    dec=$((dec+r*pow))
    pow=$((pow*5))
    n=$((n/10))
done
echo "Decimal = $dec"
```

## 3G. Factorial

``` bash
echo "Enter number:"
read n
fact=1
for ((i=1; i<=n; i++)); do fact=$((fact*i)); done
echo "Factorial = $fact"
```

## 3H. Arithmetic operations

``` bash
echo "Enter two numbers:"
read a b
echo "Addition: $((a+b))"
echo "Subtraction: $((a-b))"
echo "Multiplication: $((a*b))"
if (( b!=0 )); then
    echo "Division: $((a/b))"
    echo "Modulo: $((a%b))"
else
    echo "Division and modulo not possible"
fi
```

## 3I. Sum of digits

``` bash
echo "Enter number:"
read n
x=$n
sum=0
while (( x>0 )); do
    sum=$((sum+x%10))
    x=$((x/10))
done
echo "Sum of digits = $sum"
```

## 3J. Reverse a number

``` bash
echo "Enter number:"
read n
x=$n
rev=0
while (( x>0 )); do
    rev=$((rev*10+x%10))
    x=$((x/10))
done
echo "Reverse = $rev"
```

------------------------------------------------------------------------

# Experiment 4 -- CPU Scheduling Algorithms

*The following short FCFS and SJF programs assume all processes arrive
at time 0. SJF is non-preemptive.*

## 4A. FCFS

``` c
#include <stdio.h>
int main() {
    int n, bt[10], wt[10], tat[10], i;
    float avg=0;
    printf("Enter number of processes: ");
    scanf("%d",&n);
    for(i=0;i<n;i++) {
        printf("Burst time P%d: ",i);
        scanf("%d",&bt[i]);
    }
    wt[0]=0;
    for(i=1;i<n;i++) wt[i]=wt[i-1]+bt[i-1];
    printf("P\tBT\tWT\tTAT\n");
    for(i=0;i<n;i++) {
        tat[i]=wt[i]+bt[i];
        printf("P%d\t%d\t%d\t%d\n",i,bt[i],wt[i],tat[i]);
        avg+=wt[i];
    }
    printf("Average WT = %.2f\n",avg/n);
    return 0;
}
```

## 4B. SJF (non-preemptive)

``` c
#include <stdio.h>
int main() {
    int n, bt[10], p[10], wt[10], tat[10], i, j, t;
    float avg=0;
    printf("Enter number of processes: ");
    scanf("%d",&n);
    for(i=0;i<n;i++) {
        printf("Burst time P%d: ",i);
        scanf("%d",&bt[i]);
        p[i]=i;
    }
    for(i=0;i<n;i++)
        for(j=i+1;j<n;j++)
            if(bt[i]>bt[j]) {
                t=bt[i]; bt[i]=bt[j]; bt[j]=t;
                t=p[i]; p[i]=p[j]; p[j]=t;
            }
    wt[0]=0;
    for(i=1;i<n;i++) wt[i]=wt[i-1]+bt[i-1];
    printf("P\tBT\tWT\tTAT\n");
    for(i=0;i<n;i++) {
        tat[i]=wt[i]+bt[i];
        printf("P%d\t%d\t%d\t%d\n",p[i],bt[i],wt[i],tat[i]);
        avg+=wt[i];
    }
    printf("Average WT = %.2f\n",avg/n);
    return 0;
}
```

## 4C. Round Robin

``` c
#include <stdio.h>
int main() {
    int n, bt[10], rem[10], q, t=0, i, done;
    printf("Enter number of processes: ");
    scanf("%d",&n);
    for(i=0;i<n;i++) {
        printf("Burst time P%d: ",i);
        scanf("%d",&bt[i]);
        rem[i]=bt[i];
    }
    printf("Enter time quantum: ");
    scanf("%d",&q);
    if(q<=0) { printf("Invalid quantum"); return 0; }
    do {
        done=1;
        for(i=0;i<n;i++) if(rem[i]>0) {
            done=0;
            if(rem[i]>q) { t+=q; rem[i]-=q; }
            else { t+=rem[i]; rem[i]=0; printf("P%d completed at %d\n",i,t); }
        }
    } while(!done);
    return 0;
}
```

------------------------------------------------------------------------

# Experiment 5 -- Page Replacement Algorithms

## 5A. FIFO

``` c
#include <stdio.h>
int main() {
    int n,f,p[30],a[10],i,j,k=0,hit,fault=0;
    printf("Enter number of pages: ");
    scanf("%d",&n);
    printf("Enter pages: ");
    for(i=0;i<n;i++) scanf("%d",&p[i]);
    printf("Enter frames: ");
    scanf("%d",&f);
    if(f<1 || f>10) return 0;
    for(i=0;i<f;i++) a[i]=-1;
    for(i=0;i<n;i++) {
        hit=0;
        for(j=0;j<f;j++) if(a[j]==p[i]) hit=1;
        if(!hit) { a[k]=p[i]; k=(k+1)%f; fault++; }
        printf("%d: ",p[i]);
        for(j=0;j<f;j++) printf("%d ",a[j]);
        printf("\n");
    }
    printf("Page Faults = %d\n",fault);
    return 0;
}
```

## 5B. LRU

``` c
#include <stdio.h>
int main() {
    int n,f,p[30],a[10],t[10]={0};
    int i,j,hit,fault=0,pos;
    printf("Enter number of pages: ");
    scanf("%d",&n);
    printf("Enter pages: ");
    for(i=0;i<n;i++) scanf("%d",&p[i]);
    printf("Enter frames: ");
    scanf("%d",&f);
    if(f<1 || f>10) return 0;
    for(i=0;i<f;i++) a[i]=-1;
    for(i=0;i<n;i++) {
        hit=0;
        for(j=0;j<f;j++) if(a[j]==p[i]) {
            hit=1; t[j]=i;
        }
        if(!hit) {
            fault++; pos=-1;
            for(j=0;j<f;j++) if(a[j]==-1) { pos=j; break; }
            if(pos==-1) {
                pos=0;
                for(j=1;j<f;j++) if(t[j]<t[pos]) pos=j;
            }
            a[pos]=p[i]; t[pos]=i;
        }
        printf("%d: ",p[i]);
        for(j=0;j<f;j++) printf("%d ",a[j]);
        printf("\n");
    }
    printf("Page Faults = %d\n",fault);
    return 0;
}
```

------------------------------------------------------------------------

# Experiment 6 -- Programs to Illustrate Threads

## 6A. Create a thread

``` c
#include <stdio.h>
#include <pthread.h>

void *fun(void *arg) {
    printf("Thread is running\n");
    return NULL;
}

int main() {
    pthread_t t;
    pthread_create(&t,NULL,fun,NULL);
    pthread_join(t,NULL);
    printf("Main thread ends\n");
    return 0;
}
```

## 6B. Create two threads

``` c
#include <stdio.h>
#include <pthread.h>

void *fun(void *arg) {
    printf("Thread %d is running\n", *(int *)arg);
    return NULL;
}

int main() {
    pthread_t t[2];
    int a[2]={1,2},i;
    for(i=0;i<2;i++) pthread_create(&t[i],NULL,fun,&a[i]);
    for(i=0;i<2;i++) pthread_join(t[i],NULL);
    return 0;
}
```

------------------------------------------------------------------------

# Experiment 7 -- GNU/Linux IPC Mechanisms

## 7A. Pipe

``` c
#include <stdio.h>
#include <unistd.h>
#include <string.h>

int main() {
    int fd[2];
    char msg[]="Hello", b[20];
    pipe(fd);
    if(fork()==0) {
        close(fd[0]);
        write(fd[1],msg,strlen(msg)+1);
    } else {
        close(fd[1]);
        read(fd[0],b,sizeof(b));
        printf("Received: %s\n",b);
    }
    return 0;
}
```

## 7B. Semaphore (two threads)

``` c
#include <stdio.h>
#include <pthread.h>
#include <semaphore.h>

sem_t s;
void *fun(void *p) {
    sem_wait(&s);
    printf("Critical section\n");
    sem_post(&s);
    return NULL;
}
int main() {
    pthread_t a,b;
    sem_init(&s,0,1);
    pthread_create(&a,NULL,fun,NULL);
    pthread_create(&b,NULL,fun,NULL);
    pthread_join(a,NULL);
    pthread_join(b,NULL);
    sem_destroy(&s);
    return 0;
}
```

## 7C. Shared memory

``` c
#include <stdio.h>
#include <sys/ipc.h>
#include <sys/shm.h>
#include <string.h>

int main() {
    int id=shmget(IPC_PRIVATE,100,IPC_CREAT|0666);
    char *p=shmat(id,NULL,0);
    strcpy(p,"Hello Shared Memory");
    printf("%s\n",p);
    shmdt(p);
    shmctl(id,IPC_RMID,NULL);
    return 0;
}
```

## 7D. Message queue

``` c
#include <stdio.h>
#include <sys/ipc.h>
#include <sys/msg.h>
#include <string.h>

struct msg { long type; char text[50]; };

int main() {
    int id=msgget(IPC_PRIVATE,IPC_CREAT|0666);
    struct msg m={1,"Hello Message Queue"};
    msgsnd(id,&m,sizeof(m.text),0);
    msgrcv(id,&m,sizeof(m.text),1,0);
    printf("%s\n",m.text);
    msgctl(id,IPC_RMID,NULL);
    return 0;
}
```

------------------------------------------------------------------------

# Experiment 8 -- Classical Synchronization Problems

## 8A. Dining Philosophers (deadlock-free semaphore version)

``` c
#include <stdio.h>
#include <pthread.h>
#include <semaphore.h>
#include <unistd.h>

sem_t fork[5], room;

void *philosopher(void *arg) {
    int i=*(int *)arg;
    printf("Philosopher %d is thinking\n",i);
    sem_wait(&room);
    sem_wait(&fork[i]);
    printf("Philosopher %d picked fork %d\n",i,i);
    sem_wait(&fork[(i+1)%5]);
    printf("Philosopher %d picked fork %d\n",i,(i+1)%5);
    printf("Philosopher %d is eating\n",i);
    sleep(1);
    printf("Philosopher %d finished eating\n",i);
    sem_post(&fork[(i+1)%5]);
    sem_post(&fork[i]);
    sem_post(&room);
    return NULL;
}

int main() {
    pthread_t t[5];
    int id[5],i;
    sem_init(&room,0,4);
    for(i=0;i<5;i++) { sem_init(&fork[i],0,1); id[i]=i; }
    for(i=0;i<5;i++) pthread_create(&t[i],NULL,philosopher,&id[i]);
    for(i=0;i<5;i++) pthread_join(t[i],NULL);
    for(i=0;i<5;i++) sem_destroy(&fork[i]);
    sem_destroy(&room);
    return 0;
}
```

## 8B. Producer--Consumer (one-slot buffer)

``` c
#include <stdio.h>
#include <pthread.h>
#include <semaphore.h>

sem_t empty,full;
int item;

void *producer(void *p) {
    for(int i=1;i<=5;i++) {
        sem_wait(&empty);
        item=i;
        printf("Produced: %d\n",item);
        sem_post(&full);
    }
    return NULL;
}
void *consumer(void *p) {
    for(int i=1;i<=5;i++) {
        sem_wait(&full);
        printf("Consumed: %d\n",item);
        sem_post(&empty);
    }
    return NULL;
}
int main() {
    pthread_t p,c;
    sem_init(&empty,0,1);
    sem_init(&full,0,0);
    pthread_create(&p,NULL,producer,NULL);
    pthread_create(&c,NULL,consumer,NULL);
    pthread_join(p,NULL);
    pthread_join(c,NULL);
    sem_destroy(&empty);
    sem_destroy(&full);
    return 0;
}
```

------------------------------------------------------------------------

# Experiment 9 -- Banker's Algorithm (Deadlock Avoidance)

``` c
#include <stdio.h>
int main() {
    int n=5,m=3;
    int a[5][3]={{0,1,0},{2,0,0},{3,0,2},{2,1,1},{0,0,2}};
    int max[5][3]={{7,5,3},{3,2,2},{9,0,2},{2,2,2},{4,3,3}};
    int avail[3]={3,3,2},need[5][3],finish[5]={0},safe[5];
    int i,j,count=0,found;

    for(i=0;i<n;i++)
        for(j=0;j<m;j++) need[i][j]=max[i][j]-a[i][j];

    while(count<n) {
        found=0;
        for(i=0;i<n;i++) if(!finish[i]) {
            for(j=0;j<m;j++) if(need[i][j]>avail[j]) break;
            if(j==m) {
                for(j=0;j<m;j++) avail[j]+=a[i][j];
                safe[count++]=i;
                finish[i]=1;
                found=1;
            }
        }
        if(!found) break;
    }

    if(count==n) {
        printf("Safe state\nSequence: ");
        for(i=0;i<n;i++) printf("P%d ",safe[i]);
    } else printf("Unsafe state\n");
    return 0;
}
```

**Expected output:**

``` text
Safe state
Sequence: P1 P3 P4 P0 P2
```

------------------------------------------------------------------------

# Experiment 10 -- File Allocation Methods

## 10A. Contiguous Allocation

``` c
#include <stdio.h>
int main() {
    int s,n,i;
    printf("Enter starting block and length: ");
    scanf("%d%d",&s,&n);
    if(s<0 || n<=0 || s+n>50) {
        printf("Invalid input");
        return 0;
    }
    printf("Allocated blocks: ");
    for(i=s;i<s+n;i++) printf("%d ",i);
    return 0;
}
```

## 10B. Linked Allocation

``` c
#include <stdio.h>
int main() {
    int n,b[20],i;
    printf("Enter number of blocks: ");
    scanf("%d",&n);
    printf("Enter block numbers: ");
    for(i=0;i<n;i++) scanf("%d",&b[i]);
    for(i=0;i<n;i++) {
        if(i<n-1) printf("%d -> %d\n",b[i],b[i+1]);
        else printf("%d -> NULL\n",b[i]);
    }
    return 0;
}
```

## 10C. Indexed Allocation

``` c
#include <stdio.h>
int main() {
    int index,n,b[20],i;
    printf("Enter index block: ");
    scanf("%d",&index);
    printf("Enter number of blocks: ");
    scanf("%d",&n);
    printf("Enter file blocks: ");
    for(i=0;i<n;i++) scanf("%d",&b[i]);
    printf("Index block: %d\nFile blocks: ",index);
    for(i=0;i<n;i++) printf("%d ",b[i]);
    return 0;
}
```

------------------------------------------------------------------------

# Important Lab Notes

1.  Use `-pthread` while compiling thread and semaphore programs.
2.  The IPC programs use Linux/POSIX system calls and may not work in
    basic online C compilers.
3.  The CPU scheduling examples assume all processes arrive at time 0.
4.  The file allocation examples demonstrate allocation logic; they do
    not reserve actual disk blocks.
5.  The Banker's algorithm program checks for a safe sequence (deadlock
    avoidance), not deadlock detection.
6.  The Dining Philosophers program uses a room semaphore initialized to
    4 to prevent deadlock.
7.  For shell scripts, use Bash (`bash filename.sh`).
